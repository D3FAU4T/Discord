export interface twitchDataSuccessResponse {
    id: string,
    displayName: string,
    createdAt: string,
    updatedAt: string,
    deletedAt: string,
    userType: "" | "staff" | "admin" | "global_mod",
    broadcasterType: "partner" | "affiliate" | "",
    unavailableReason: string
}

export interface twitchDataFailureResponse {
    status: number,
    error: string
}