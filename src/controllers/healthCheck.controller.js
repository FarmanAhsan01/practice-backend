//healthCheck
const healthCheck = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, { status: "ok" }, "Server is healthy ✅")
  );
});