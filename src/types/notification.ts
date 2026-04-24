export interface TransferRequest {
  id: string;
  userId: string;
  fromModeratorId: string;
  toModeratorId: string;
  toModeratorName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  respondedAt?: string;
}

export interface UserNotification {
  id: string;
  type: "transfer-request";
  message: string;
  data: { transferRequestId: string; toModeratorName: string; toModeratorId: string };
  read: boolean;
  createdAt: string;
}
