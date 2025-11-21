
export interface CreatePostRequestBody {
    region_code: string;
    price: number;
    delivery_charge: number;
    transaction_type: string;
    content: string;
    title: string;
    category_name?: string;
    images?: Express.Multer.File[];
}