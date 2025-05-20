import { Suspense } from "react";

import { getTranslations } from "next-intl/server";

import {
	AverageBlockTime,
	Delegations,
	FinalityProviders,
	LatestBlock,
	Stakers,
	SupportedChains,
	TotalStake,
	Transactions,
	Validators,
	WalletAddresses,
} from "@cosmoscan/core/components/home/statistical-data";
import {
	BlocksSkeletonTable,
	BlocksTable,
	StakingTransactionsSkeletonTable,
	StakingTransactionsTable,
} from "@cosmoscan/core/components/home/table-data";
import {
	HomeBannerWrapper,
	HomePageWrapper,
	HomeStatisticalDataWrapper,
	HomeTableDataWrapper,
} from "@cosmoscan/core/pages/home";
import { BABYLON_PHASE3 } from "@cosmoscan/shared/constants/chain";
import {
	AddressesIcon,
	BlockIcon,
	ChainsIcon,
	DelegationsIcon,
	PeopleIcon,
	ProvidersIcon,
	StakeIcon,
	TimeIcon,
	TransactionsIcon,
	ValidatorsIcon,
} from "@cosmoscan/ui/icons/statistical";

import { ROUTES } from "@/constants/routes";

export default async function Home() {
	const t = await getTranslations("Home");

	const BtcStakingData = {
		title: t("btcStaking"),
		content: [
			{
				icon: StakeIcon,
				label: t("totalStake"),
				value: <TotalStake />,
			},
			{
				icon: PeopleIcon,
				label: t("stakers"),
				value: <Stakers />,
			},
			{
				icon: ProvidersIcon,
				label: t("finalityProviders"),
				value: <FinalityProviders />,
			},
			{
				icon: DelegationsIcon,
				label: t("delegations"),
				value: <Delegations />,
			},
			// {
			//   icon: ValueIcon,
			//   label: t('averageAPY'),
			//   value: <AverageAPY />,
			// },
			...(BABYLON_PHASE3
				? [
						{
							icon: ChainsIcon,
							label: t("supportedChains"),
							value: <SupportedChains />,
						},
					]
				: []),
		],
	};

	const ChainSummaryData = {
		title: t("chainSummary"),
		content: [
			{
				icon: TimeIcon,
				label: t("averageBlockTime"),
				value: <AverageBlockTime />,
			},
			{
				icon: TransactionsIcon,
				label: t("transactions"),
				value: <Transactions />,
			},
			{
				icon: ValidatorsIcon,
				label: t("activeValidators"),
				value: <Validators />,
			},
			{
				icon: BlockIcon,
				label: t("latestBlock"),
				value: <LatestBlock />,
			},
			{
				icon: AddressesIcon,
				label: t("walletAddresses"),
				value: <WalletAddresses />,
			},
		],
	};

	const TableData = [
		{
			title: t("stakingTransactions"),
			linkText: t("viewAll"),
			link: ROUTES.staking.transactions.index,
			content: (
				<Suspense fallback={<StakingTransactionsSkeletonTable />}>
					<StakingTransactionsTable />
				</Suspense>
			),
		},
		{
			title: t("latestBlocks"),
			linkText: t("viewAll"),
			link: ROUTES.blockchain.blocks.index,
			content: (
				<Suspense fallback={<BlocksSkeletonTable />}>
					<BlocksTable />
				</Suspense>
			),
		},
	];

	return (
		<HomePageWrapper>
			<HomeBannerWrapper />

			{/* BTC Staking Stats */}
			<HomeStatisticalDataWrapper statisticalData={[BtcStakingData]} />

			{/* Chain Summary Stats */}
			<HomeStatisticalDataWrapper statisticalData={[ChainSummaryData]} />

			<HomeTableDataWrapper tableData={TableData} />
		</HomePageWrapper>
	);
}
