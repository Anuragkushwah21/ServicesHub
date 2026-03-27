export class ApiResponse {
  static success(data: any, message: string = "Success", status: number = 200) {
    return Response.json({ success: true, message, data }, { status });
  }

  static error(message: string, status: number = 400) {
    return Response.json({ success: false, message }, { status });
  }

  static unauthorized(message: string = "Unauthorized") {
    return Response.json({ success: false, message }, { status: 401 });
  }

  static forbidden(message: string = "Forbidden") {
    return Response.json({ success: false, message }, { status: 403 });
  }

  static notFound(message: string = "Not found") {
    return Response.json({ success: false, message }, { status: 404 });
  }

  static serverError(message: string = "Internal server error") {
    return Response.json({ success: false, message }, { status: 500 });
  }
}
