"use client";
import {
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  ScrollShadow,
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
  // Add a unique _rowIdx to each item for keying
  const keyedData = data.map((item, i) => ({ ...item, _rowIdx: i }));

  return (
    <Table
      isHeaderSticky
      aria-label="Rewards Table"
      classNames={{ base: "max-h-[520px]  overflow-auto", table: "min-w-full" }}
      radius="sm"
    >
      <TableHeader>
        <TableColumn key="uid">UID</TableColumn>
        {/* <TableColumn key="answer">Response</TableColumn> */}
        <TableColumn key="polarity">Polarity</TableColumn>
        <TableColumn key="score">Score</TableColumn>
        <TableColumn key="pctShare">Closeness</TableColumn>
        <TableColumn key="rewardUSD">Rewards</TableColumn>
      </TableHeader>

      <TableBody
        isLoading={isLoading}
        items={keyedData}
        loadingContent={<Spinner color="white" />}
      >
        {(item) => (
          <TableRow
            key={item.uid + "-" + item._rowIdx}
            className="hover:bg-default-100"
          >
            {(columnKey) => (
              <TableCell>
                {columnKey === "pctShare" ? (
                  `${item.pctShare.toFixed(1)}%`
                ) : columnKey === "rewardUSD" ? (
                  `${item.rewardUSD.toFixed(2)}%`
                ) : columnKey === "score" ? (
                  typeof item.score === "number" ? (
                    item.score.toFixed(4)
                  ) : (
                    item.score
                  )
                ) : columnKey === "answer" ? (
                  <ScrollShadow
                    className="w-40 whitespace-nowrap"
                    orientation="horizontal"
                  >
                    {(item as any)[columnKey]}
                  </ScrollShadow>
                ) : columnKey === "uid" ? (
                  <ScrollShadow
                    className="w-24 whitespace-nowrap"
                    orientation="horizontal"
                  >
                    {(item as any)[columnKey]}
                  </ScrollShadow>
                ) : (
                  (item as any)[columnKey]
                )}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
