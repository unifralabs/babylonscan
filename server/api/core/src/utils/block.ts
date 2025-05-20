import Prisma from '@cosmoscan/core-db';

export async function getBlockDetail(db: typeof Prisma, height: number) {
  // Get the basic block details
  const block = await db.blocks.findUnique({
    where: {
      height,
    },
    omit: {
      block_events: true,
      raw_json: true,
      inserted_at: true,
      updated_at: true,
    },
  });

  if (!block) {
    return null;
  }

  // If there's a proposer address, get the validator name
  let proposerName = null;
  if (block.proposer_address) {
    const validator = await db.validators.findFirst({
      where: {
        operator_address: block.proposer_address,
      },
      select: {
        name: true,
      },
    });
    
    proposerName = validator?.name || null;
  }

  // Return block with proposer name
  return {
    ...block,
    proposer_name: proposerName,
  };
}

// Function to get block signatures by block height
export async function getBlockSignatures(db: typeof Prisma, height: number) {
  try {
    // Get all active validators with voting power
    const activeValidators = await db.validators.findMany({
      where: {
        status: 'BOND_STATUS_BONDED', // Only include active validators
      },
      select: {
        operator_address: true,
        name: true,
        id: true,
        voting_power: true, // Include voting power for sorting
      },
      orderBy: {
        voting_power: 'desc', // Order validators by voting power (descending)
      },
    });

    console.log(`Block ${height} - Active validators: ${activeValidators.length}`);

    // Get all signatures for the block
    const signatures = await db.block_signatures.findMany({
      where: {
        block_height: height,
      },
    });

    const totalSignatures = signatures.length;
    const signedSignatures = signatures.filter(sig => sig.signed === 1).length;
    
    console.log(`Block ${height} - Total signatures: ${totalSignatures}`);
    console.log(`Block ${height} - Signed signatures: ${signedSignatures}`);

    // Create a map for quick signature lookup
    const signatureMap = new Map();
    signatures.forEach((sig) => {
      signatureMap.set(sig.validator_address, {
        signed: sig.signed === 1,
        timestamp: Number(sig.timestamp),
      });
    });

    // Create result for all active validators
    const result = activeValidators.map((validator, index) => {
      const signatureInfo = signatureMap.get(validator.operator_address);
      
      return {
        index: index + 1, // 1-based index
        validator_address: validator.operator_address,
        validator_name: validator.name || undefined,
        signed: signatureInfo ? signatureInfo.signed : false,
        timestamp: signatureInfo ? signatureInfo.timestamp : 0,
        voting_power: validator.voting_power ? Number(validator.voting_power) : 0, // Include voting power in result
      };
    });

    // Return result and metadata
    return {
      validators: result, // Already sorted by voting power from the database query
      metadata: {
        totalSigned: signedSignatures, // Total number of signatures
        activeValidators: activeValidators.length // Total number of active validators
      }
    };
  } catch (error) {
    console.error('Error fetching block signatures:', error);
    return { 
      validators: [], 
      metadata: { 
        totalSigned: 0, 
        activeValidators: 0
      } 
    };
  }
}
