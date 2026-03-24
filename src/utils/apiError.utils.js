export const apiError = async (status = 500, message = "Something went wrong") => {

    const result = {
        status,
        message,
        success: status < 400
    }

    console.log(result)

    return result
}