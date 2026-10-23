export type SocialCapabilities = {
  upload: boolean;
  publish: boolean;
  schedule: boolean;
  comments: boolean;
  analytics: boolean;
  thumbnails: boolean;
  captions: boolean;
  visibility: boolean;
};

export interface AIProvider {
  generate(input: { prompt: string; workspaceId: string }): Promise<{ text: string }>;
}

export interface PaymentProvider {
  createPayment(input: { workspaceId: string; amount: number; currency: string }): Promise<{ orderId: string }>;
  verifyPayment(input: { orderId: string }): Promise<{ paid: boolean; transactionId?: string }>;
}

export interface SocialProvider {
  getCapabilities(): SocialCapabilities;
  connect(input: { redirectUri: string; state: string }): Promise<{ authorizationUrl: string }>;
}

export interface StorageService {
  createSignedUpload(input: { workspaceId: string; filename: string; contentType: string }): Promise<{ path: string; signedUrl: string }>;
}

export interface VideoService {
  enqueueProcessing(input: { workspaceId: string; mediaId: string }): Promise<{ jobId: string }>;
}
