import { MerkleTree } from "merkletreejs";
import { keccak256, Hex } from "viem";

export interface MerkleLeaf {
  address: Hex;
  amount: bigint;
}

export function generateMerkleTree(leavesData: MerkleLeaf[]): {
  tree: MerkleTree;
  leaves: Hex[];
  root: Hex;
} {
  const leaves = leavesData.map((data) => keccak256(encodeMerkleLeaf(data)));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = `0x${tree.getRoot().toString("hex")}` as Hex;

  return { tree, leaves, root };
}

export function encodeMerkleLeaf(leaf: MerkleLeaf): Hex {
  return keccak256(
    new TextEncoder().encode(
      JSON.stringify({ address: leaf.address, amount: leaf.amount.toString() }),
    ),
  );
}

export function getMerkleProof(tree: MerkleTree, leaf: Hex): Hex[] {
  const proof = tree
    .getProof(leaf)
    .map((x) => `0x${x.data.toString("hex")}` as Hex);

  return proof;
}
