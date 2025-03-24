type Success<T> = {
    data: T
    error: null
}

type Failure<T> = {
    data: null
    error: T
}

type Result<T, E = Error> = Success<T> | Failure<E>

export async function tryCatch<T, E>(promise: Promise<T>): Promise<Result<T, E>> {
    try {
        const data = await promise
        return { data, error: null }
    } catch (error) {
        return { data: null, error: error as E }
    }
}
