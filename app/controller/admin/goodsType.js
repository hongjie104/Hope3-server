const Controller = require('../../core/baseController');

class GoodsTypeController extends Controller {
    async index() {
        this.success('hi, welcome to goodsType controller!');
    }

    async find() {
        let {
            name,
            page,
            count,
        } = this.ctx.request.body;
        page = page || 1;
        count = count || 10;
        // this.ctx.validate({
        //     page: 'number',
        //     count: 'number',
        // });
        const query = {};
        if (name) {
            query.name = {
                $regex: name,
                $options: 'i',
            };
        }
        const list = await this.ctx.model.GoodsType.find(query).skip((page - 1) * count).limit(count);
        const total = await this.ctx.model.GoodsType.count(query);
        this.success({
            list,
            pagination: {
                total,
                current: page,
            },
        });
    }

    async detail() {
        const { _id } = this.ctx.params;
        const goodsType = await this.ctx.model.GoodsType.findOne({ _id });
        // 找出品牌数据
        const brands = await this.ctx.model.Brand.find();
        const category = await this.ctx.model.Category.find();
        if (goodsType) {
            this.success({ goodsType, brands, category });
        } else {
            this.fail(`没有找到id为${_id}的款型`);
        }
    }

    // async update() {
    //     const {
    //         id,
    //         name,
    //         domain,
    //     } = this.ctx.request.body;
    //     await this.ctx.model.Platform.update({ _id: id }, { $set: { name, domain } });
    //     this.success();
    // }

    async add() {
        const {
            name,
            gender,
            category,
            subCategory,
            brand,
            series,
            colorName,
            colorValue,
            number,
            imgs,
            platform,
            platform_id,
            url,
            size_price_arr,
        } = this.ctx.request.body;
        let goodsType = await this.ctx.model.GoodsType.findOne({ name }, { id: 1 });
        if (!goodsType) {
            // 新建商品
            let id = await this.ctx.service.createId.getId('Goods');
            const goods = new this.ctx.model.Goods({
                id,
                name,
                url,
                number,
                sku: size_price_arr,
                imgs: imgs.map(img => `${platform}/${img}`),
                platform_id,
            });
            await goods.save();
            // 新建配色
            id = await this.ctx.service.createId.getId('GoodsColor');
            const goodsColor = new this.ctx.model.GoodsColor({
                id,
                colorName: colorName || '',
                colorValue: colorValue || '',
                number: [ number ],
                img: Array.isArray(imgs) && imgs.length > 0 ? `${platform}/${imgs[0]}` : '',
                goods_id_arr: [ goods._id ],
            });
            await goodsColor.save();

            id = await this.ctx.service.createId.getId('GoodsType');
            const data = {
                id, name, goods_color_arr: [ goodsColor._id ],
            };
            if (gender) { data.gender = gender; }
            if (category) { data.category = category; }
            if (subCategory) { data.subCategory = subCategory; }
            if (brand) { data.brand = brand; }
            if (/\w{24}/.test(series)) { data.series = series; }
            goodsType = new this.ctx.model.GoodsType(data);
            await goodsType.save();
            this.success();
        } else {
            this.fail(`已存在名字为${name}的款型了`);
        }
    }
}

module.exports = GoodsTypeController;
