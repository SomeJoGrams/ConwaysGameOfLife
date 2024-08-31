

function precprocess(content, loaderContext) {
    let result;
    try {
        result = Handlebars.compile(content)({
        });
    } catch (error) {
        loaderContext.emitError(error);
        return content;
    }
    return result;
}
    