import {
    Model,
    Document,
    FilterQuery,
    UpdateQuery,
    Types,
} from 'mongoose';


// type Lean<T> = Omit<T, "_id" | "__v"> & { _id: string };
type Lean<T> = T extends Document ? Omit<T, keyof Document> : T;


export default class BaseRepository<T extends Document> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    findOne(filter: FilterQuery<T>): Promise<T | null> {
        return this.model.findOne(filter);
    }


    async findAll(): Promise<Lean<T>[]> {
        return (await this.model.find().lean()) as unknown as Lean<T>[];
    }


    async findById(id: string): Promise<Lean<T> | null> {
        return (await this.model.findById(id).lean()) as unknown as Lean<T> | null;
    }


    async create(data: Partial<T>): Promise<T> {
        return await this.model.create(data);
    }


    async updateById(
        id: string,
        data: UpdateQuery<T>
    ): Promise<Lean<T> | null> {
        return (await this.model
            .findByIdAndUpdate(id, data, { new: true })
            .lean()) as unknown as Lean<T> | null;
    }


    async deleteById(id: string): Promise<Lean<T> | null> {
        return (await this.model.findByIdAndDelete(id).lean()) as unknown as Lean<T> | null;
    }


    async findWithPagination(
        filter: Record<string, any>,
        page: number,
        limit: number,
        sort: Record<string, 1 | -1> = {}
    ): Promise<{
        data: Lean<T>[];
        totalCount: number;
        totalPages: number;
        currentPage: number;
    }> {
        const skip = (page - 1) * limit;

        const [data, totalCount] = await Promise.all([
            this.model.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            this.model.countDocuments(filter),
        ]);

        return {
            data: data as unknown as Lean<T>[],
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        };
    }


}
