import { api } from "@/lib/api";
import type {
  ClosetCheckRequest,
  ClosetCheckResponse,
  StylePieceRequest,
  StylePieceResponse,
} from "@/types";

export async function checkClosetFit(
  payload: ClosetCheckRequest
): Promise<ClosetCheckResponse> {
  const { data } = await api.post("/api/item-analysis/closet-check", payload);
  return data;
}

export async function stylePiece(
  payload: StylePieceRequest
): Promise<StylePieceResponse> {
  const { data } = await api.post("/api/item-analysis/style-piece", payload);
  return data;
}
