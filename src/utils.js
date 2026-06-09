
export class Result {

    success;
    message;
    data;

    constructor(success, message, data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    static ok(data) {
        return new Result(true, null, data);
    }

    static fail(message) {
        return new Result(false, message, null);
    }
}

export class ResultPage extends Result {

    size;
    offset;

    constructor(success, message, data, size, offset) {
        super(success, message, data);
        this.size = size;
        this.offset = offset;
    }

    static of(data, size, offset) {
        return new ResultPage(true, null, data, size, offset);
    }
}

export function sendResult(result, response, code) {

    if (!result instanceof Result) {
        throw new Error('Invalid response, expected Result type');
    }

    if (!result.success) {
        response.status(400).json(result);
        return;
    }

    response.status(code).json(result);
}

export function isNonBlankString(str) {
    return typeof str === 'string' && str.trim() !== '';
}

export function isPositiveInteger(value) {
    return Number.isInteger(value) && value >= 0;
}

