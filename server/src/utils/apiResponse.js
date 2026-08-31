const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}, pagination = null) => {
  const responseObj = {
    success: true,
    message,
    data,
  };
  if (pagination) {
    responseObj.pagination = pagination;
  }
  return res.status(statusCode).json(responseObj);
};

module.exports = {
  sendSuccess,
};
