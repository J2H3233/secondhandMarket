export interface CreateCategoryRequestBody {
    category_name: string;
    parent_name: string | null;
}