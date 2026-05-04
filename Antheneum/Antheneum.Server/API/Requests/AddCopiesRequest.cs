namespace API.Requests;

public record AddCopiesRequest(int BranchId, int Count = 1);
