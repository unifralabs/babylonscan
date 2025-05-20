CREATE MATERIALIZED VIEW IF NOT EXISTS mv_average_block_time AS
WITH time_diff AS (
  SELECT
    (timestamp - LAG(timestamp) OVER (ORDER BY timestamp)) AS diff
  FROM
    (SELECT timestamp
     FROM blocks
     ORDER BY timestamp DESC
     LIMIT 100) AS recent_blocks
  ORDER BY timestamp
)
SELECT
  COALESCE(AVG(diff), 0) AS avg
FROM
  time_diff;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_average_block_time ON mv_average_block_time (avg);

CREATE OR REPLACE FUNCTION refresh_mv_average_block_time() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_average_block_time;
END;
$$ LANGUAGE plpgsql;


CREATE MATERIALIZED VIEW IF NOT EXISTS mv_unique_address_count AS 
SELECT COUNT(DISTINCT combined_addresses.address) AS count
FROM (
    SELECT "bbn_address" AS address FROM address_meta
    UNION
    SELECT DISTINCT "address" FROM transaction_addresses
) AS combined_addresses;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_unique_address_count ON mv_unique_address_count (count);

CREATE OR REPLACE FUNCTION refresh_mv_unique_address_count() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_unique_address_count;
END;
$$ LANGUAGE plpgsql;


CREATE MATERIALIZED VIEW IF NOT EXISTS mv_validator_uptime AS
WITH recent_blocks AS (
    SELECT DISTINCT block_height
    FROM block_signatures
    ORDER BY block_height DESC
    LIMIT 10000
),
total_blocks AS (
    SELECT COUNT(*) AS total_block_count
    FROM recent_blocks
),
validator_signatures AS (
    SELECT
        bs.validator_address,
        COUNT(*) AS signed_block_count
    FROM
        block_signatures bs
    WHERE
        bs.block_height IN (SELECT block_height FROM recent_blocks)
        AND bs.signed = 1
    GROUP BY
        bs.validator_address
),
validator_uptime AS (
    SELECT
        v.operator_address,
        v.name,
        COALESCE(vs.signed_block_count, 0) AS signed_block_count,
        tb.total_block_count,
        CASE
            WHEN tb.total_block_count > 0 THEN (COALESCE(vs.signed_block_count, 0)::decimal / tb.total_block_count) 
            ELSE 0
        END AS uptime_percentage
    FROM
        validators v
    LEFT JOIN
        validator_signatures vs
    ON
        v.operator_address = vs.validator_address
    CROSS JOIN
        total_blocks tb
)
SELECT
    operator_address,
    name,
    signed_block_count,
    total_block_count,
    uptime_percentage
FROM
    validator_uptime
ORDER BY
    uptime_percentage DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_validator_uptime_operator_address ON mv_validator_uptime (operator_address);

CREATE OR REPLACE FUNCTION refresh_mv_validator_uptime() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_validator_uptime;
END;
$$ LANGUAGE plpgsql;


CREATE MATERIALIZED VIEW IF NOT EXISTS mv_finality_provider_uptime AS
WITH recent_blocks AS (
    SELECT DISTINCT height
    FROM finality_votes
    ORDER BY height DESC
    LIMIT 10000
),
total_blocks AS (
    SELECT COUNT(*) AS total_block_count
    FROM recent_blocks
),
provider_votes AS (
    SELECT
        fv.btc_pk,
        COUNT(*) AS signed_block_count
    FROM
        finality_votes fv
    WHERE
        fv.height IN (SELECT height FROM recent_blocks)
    GROUP BY
        fv.btc_pk
),
provider_uptime AS (
    SELECT
        fp.btc_pk,
        fp.name,
        COALESCE(pv.signed_block_count, 0) AS signed_block_count,
        tb.total_block_count,
        CASE
            WHEN tb.total_block_count > 0 THEN (COALESCE(pv.signed_block_count, 0)::decimal / tb.total_block_count)
            ELSE 0
        END AS uptime_percentage
    FROM
        finality_providers fp
    LEFT JOIN
        provider_votes pv
    ON
        fp.btc_pk = pv.btc_pk
    CROSS JOIN
        total_blocks tb
)
SELECT
    btc_pk,
    name,
    signed_block_count,
    total_block_count,
    uptime_percentage
FROM
    provider_uptime
ORDER BY
    uptime_percentage DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_finality_provider_uptime_btc_pk ON mv_finality_provider_uptime (btc_pk);

CREATE OR REPLACE FUNCTION refresh_mv_finality_provider_uptime() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_finality_provider_uptime;
END;
$$ LANGUAGE plpgsql;


CREATE MATERIALIZED VIEW IF NOT EXISTS mv_epoch_stats AS
WITH ended AS (
 select concat('{"avg":', COALESCE(floor(AVG(ended_time_diff)), 0), ', "stddev":', COALESCE(floor(stddev(ended_time_diff)), 0), '}') as checkpoint_ended, '1' as key
 from (
  SELECT
    (last_block_time - LAG(last_block_time) OVER (ORDER BY last_block_time)) AS ended_time_diff
  FROM
    (SELECT last_block_time
     FROM babylon_epochs
     ORDER BY epoch DESC
     LIMIT 100) AS recent_epochs
) as diffs),
sealed AS (
  select concat('{"avg":', COALESCE(floor(AVG(sealed_time_diff)), 0), ', "stddev":', COALESCE(floor(stddev(sealed_time_diff)), 0), '}') as checkpoint_sealed, '1' as key
  from (
  SELECT
    (sealed_block_time - last_block_time) AS sealed_time_diff, '1' as key
  FROM
    (SELECT ckpt.epoch as epoch, ckpt.block_time as sealed_block_time, ep.last_block_time
     FROM babylon_checkpoint_lifecycle ckpt
     left join babylon_epochs ep
     on ckpt.epoch = ep.epoch
     where ckpt.status_desc = 'CKPT_STATUS_SEALED'
     ORDER BY epoch DESC
     LIMIT 100) AS recent_epochs
) as diffs),
submitted AS (
  select concat('{"avg":', COALESCE(floor(AVG(submitted_time_diff)), 0), ', "stddev":', COALESCE(floor(stddev(submitted_time_diff)), 0), '}') as checkpoint_submitted, '1' as key
  from (
  SELECT
    (submitted_block_time - sealed_block_time) AS submitted_time_diff, '1' as key
  FROM
    (SELECT sealed_ckpt.epoch as epoch, sealed_ckpt.block_time as sealed_block_time, submitted_ckpt.block_time as submitted_block_time
     FROM babylon_checkpoint_lifecycle sealed_ckpt
     left join babylon_checkpoint_lifecycle submitted_ckpt
     on sealed_ckpt.epoch = submitted_ckpt.epoch
     where sealed_ckpt.status_desc = 'CKPT_STATUS_SEALED'
     and submitted_ckpt.status_desc = 'CKPT_STATUS_SUBMITTED'
     ORDER BY epoch DESC
     LIMIT 100) AS recent_epochs
) as diffs),
confirmed AS (
  select concat('{"avg":', COALESCE(floor(AVG(confirmed_time_diff)), 0), ', "stddev":', COALESCE(floor(stddev(confirmed_time_diff)), 0), '}') as checkpoint_confirmed, '1' as key
  from (
  SELECT
    (confirmed_block_time - submitted_block_time) AS confirmed_time_diff, '1' as key
  FROM
    (SELECT confirmed_ckpt.epoch as epoch, submitted_ckpt.block_time as submitted_block_time, confirmed_ckpt.block_time as confirmed_block_time
     FROM babylon_checkpoint_lifecycle submitted_ckpt
     left join babylon_checkpoint_lifecycle confirmed_ckpt
     on confirmed_ckpt.epoch = submitted_ckpt.epoch
     where  submitted_ckpt.status_desc = 'CKPT_STATUS_SUBMITTED'
     and confirmed_ckpt.status_desc = 'CKPT_STATUS_CONFIRMED'
     ORDER BY epoch DESC
     LIMIT 100) AS recent_epochs
) as diffs),
 finalized AS (
  select concat('{"avg":', COALESCE(floor(AVG(finalized_time_diff)), 0), ', "stddev":', COALESCE(floor(stddev(finalized_time_diff)), 0), '}') as checkpoint_finalized, '1' as key
  from (
  SELECT
    (finalied_block_time - confirmed_block_time) AS finalized_time_diff, '1' as key
  FROM
    (SELECT finalized_ckpt.epoch as epoch, confirmed_ckpt.block_time as confirmed_block_time, finalized_ckpt.block_time as finalied_block_time
     FROM babylon_checkpoint_lifecycle confirmed_ckpt
     left join babylon_checkpoint_lifecycle finalized_ckpt
     on confirmed_ckpt.epoch = finalized_ckpt.epoch
     where  confirmed_ckpt.status_desc = 'CKPT_STATUS_CONFIRMED'
     and  finalized_ckpt.status_desc = 'CKPT_STATUS_FINALIZED'
     ORDER BY epoch DESC
     LIMIT 100) AS recent_epochs
) as diffs)
select
  checkpoint_ended,
  checkpoint_sealed,
  checkpoint_submitted,
  checkpoint_confirmed,
  checkpoint_finalized
from
  ended join sealed
  on ended.key = sealed.key
  join submitted
  on sealed.key = submitted.key
  join confirmed
  on submitted.key = confirmed.key
  join finalized
  on confirmed.key = finalized.key;
;

CREATE OR REPLACE FUNCTION refresh_mv_epoch_stats() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_epoch_stats;
END;
$$ LANGUAGE plpgsql;


CREATE MATERIALIZED VIEW IF NOT EXISTS mv_contract_stats AS
WITH executes AS (
 SELECT address, count(1) as execute_counts
 FROM contract_execute_history
 GROUP BY address 
)
SELECT
  address,
  execute_counts
FROM
  executes;


CREATE OR REPLACE FUNCTION refresh_mv_contract_stats() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_contract_stats;
END;
$$ LANGUAGE plpgsql;


CREATE MATERIALIZED VIEW mv_validator_inclusion_rate AS
WITH recent_epochs AS (
  SELECT DISTINCT epoch
  FROM babylon_epoch_validators
  ORDER BY epoch DESC
  LIMIT 50
),
validator_counts AS (
  SELECT
    validator,
    COUNT(*) AS appearance_count
  FROM babylon_epoch_validators
  WHERE epoch IN (SELECT epoch FROM recent_epochs)
  GROUP BY validator
),
total_epochs AS (
  SELECT COUNT(*) AS total_count
  FROM recent_epochs
)
SELECT
  vc.validator,
  vc.appearance_count,
  te.total_count,
  (vc.appearance_count::float / te.total_count) AS inclusion_rate
FROM validator_counts vc
CROSS JOIN total_epochs te
ORDER BY inclusion_rate DESC;

CREATE UNIQUE INDEX ON mv_validator_inclusion_rate (validator);

CREATE OR REPLACE FUNCTION refresh_mv_validator_inclusion_rate()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_validator_inclusion_rate;
END;
$$ LANGUAGE plpgsql;