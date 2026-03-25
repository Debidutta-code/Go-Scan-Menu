export const getCategoryId = (categoryId) => {
    if (typeof categoryId === 'string')
        return categoryId;
    if (categoryId && typeof categoryId === 'object' && '_id' in categoryId) {
        return categoryId._id;
    }
    return '';
};
export const getCategoryName = (categoryId, categories) => {
    if (typeof categoryId === 'object' && categoryId?.name) {
        return categoryId.name;
    }
    const category = categories.find((cat) => cat._id === getCategoryId(categoryId));
    return category?.name || 'Uncategorized';
};
