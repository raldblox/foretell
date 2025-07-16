"use client";
import {
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

export interface RewardEntry {
  uid: string;
  answer?: string;
  polarity: number;
  score: number;
  pctShare: number;
  rewardUSD: number;
}

interface RewardTableProps {
  data: RewardEntry[];
  isLoading?: boolean;
}

export function RewardTable({ data, isLoading = false }: RewardTableProps) {
  return (
    <Table
      isHeaderSticky
      aria-label="Rewards Table"
      classNames={{ base: "max-h-[520px]  overflow-auto", table: "min-w-full" }}
      radius="sm"
    >
      <TableHeader>
        <TableColumn key="uid">UID</TableColumn>
        <TableColumn key="answer">Response</TableColumn>
        <TableColumn key="polarity">Polarity</TableColumn>
        <TableColumn key="score">Intensity</TableColumn>
        <TableColumn key="pctShare">Closeness</TableColumn>
        <TableColumn key="rewardUSD">Rewards</TableColumn>
      </TableHeader>

      <TableBody
        isLoading={isLoading}
        items={data}
        loadingContent={<Spinner color="white" />}
      >
        {(item) => (
          <TableRow key={item.uid} className="hover:bg-default-100">
            {(columnKey) => (
              <TableCell>
                {columnKey === "pctShare"
                  ? `${item.pctShare.toFixed(1)}%`
                  : columnKey === "rewardUSD"
                    ? `${item.rewardUSD.toFixed(4)}`
                    : (item as any)[columnKey]}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
