'use client';

export interface ApparelProduct {
    id: string;
    image: string;
    name: string;
    price: number;
    originalPrice?: number;
    colors?: string[];
    category: 'plain' | 'premade';
}

const plainImages = [
    '/Apparel Media/Plain Shirts/1_0cde144d-2ae2-4293-aeb9-181ad08d442b.webp',
    '/Apparel Media/Plain Shirts/1_1_3f987ad7-0442-4b8e-935a-c67e67734347.webp',
    '/Apparel Media/Plain Shirts/1_6_8aada9e1-9a1a-4388-8100-c88218e71abc.webp',
    '/Apparel Media/Plain Shirts/5_4c4f3d39-f246-49de-80c9-36ec1175fa1d.webp',
    '/Apparel Media/Plain Shirts/68b5646dc0156135f89363cabfb95c7470b5d36e.avif',
    '/Apparel Media/Plain Shirts/8c0384237732f81c0cdd81c011f4506ac13e606c.avif',
    '/Apparel Media/Plain Shirts/F1385106618_2_e070b798-a589-4335-b08b-f1be1c7c7aac.webp',
    '/Apparel Media/Plain Shirts/F1385106704_2_2379b6cb-20c3-43f8-b3a2-1166dc7c19b2.webp',
    '/Apparel Media/Plain Shirts/F1385106704_c7648f7d-8c55-44cd-9530-848267ddb8a6.webp',
    '/Apparel Media/Plain Shirts/F1411106001_3.webp',
    '/Apparel Media/Plain Shirts/F1466106901_2_9626f74e-d4cc-4ccf-88a3-c840831c6794.webp',
    '/Apparel Media/Plain Shirts/F1472106801_3_a34a80af-f389-40c4-8734-ed59a2eafa9e.webp',
    '/Apparel Media/Plain Shirts/FMTBF22-005-1_fd2756e2-8d08-4365-8ee8-01311e6d2848_960x_crop_center.webp',
    '/Apparel Media/Plain Shirts/FMTBT5-004_2_thumbnail_640x_crop_center.webp',
    '/Apparel Media/Plain Shirts/Female Model Plain Shirt.avif',
    '/Apparel Media/Plain Shirts/Male Model Plain Shirt.avif',
    '/Apparel Media/Plain Shirts/Salt-Men-Tees-Color-Blue-100_-Cotton-Jersy-Relax-Fit-MN-TS-SS25-344-Half-Front.webp',
    '/Apparel Media/Plain Shirts/Salt-Men-Tees-Color-Coffee-Blended-Regular-Fit-MN-TS-WS25-037-Halffront-2.webp',
    '/Apparel Media/Plain Shirts/Salt-Men-Tees-Color-F-Dnm-100_Cotton-RegularFit-MN-TS-WS25-008-Half-Front.webp',
    '/Apparel Media/Plain Shirts/Salt-Men-Tees-Color-Grey-100_-Cotton-Jersy-Relax-Fit-MN-TS-SS25-057-Half-Front.webp',
    '/Apparel Media/Plain Shirts/Salt-Men-Tees-Color-Taupe-Blended-Regular-Fit-MN-TS-WS25-042-Half-Front.webp',
    '/Apparel Media/Plain Shirts/Salt-Men-Tees-Color-Winery-100_-Cotton-Jersy-Regular-Fit-MN-TS-WS25-033-Half-Front.webp',
    '/Apparel Media/Plain Shirts/Salt-Men-Tees-Color-Winery-100_-Cotton-Jersy-Regular-Fit-MN-TS-WS25-033-Zoom_940x.webp',
    '/Apparel Media/Plain Shirts/Screenshot-2024-05-30-14-17-56-549_com.android.chrome-edit.webp',
    '/Apparel Media/Plain Shirts/Screenshot-20240326_061941_Chrome.webp',
    '/Apparel Media/Plain Shirts/Screenshot-20240326_062516_Chrome.webp',
    '/Apparel Media/Plain Shirts/Screenshot-20240326_062735_Chrome.webp',
    '/Apparel Media/Plain Shirts/Screenshot-20240326_062803_Chrome.webp',
    '/Apparel Media/Plain Shirts/Screenshot-20240326_062939_Chrome.webp',
    '/Apparel Media/Plain Shirts/Screenshot-20240326_063004_Chrome.webp',
];

const premadeImages = [
    '/Apparel Media/Graphic Shirts/07c7abaacf40591a7b886dec77a825fc8b6f49f8_original.jpeg',
    '/Apparel Media/Graphic Shirts/13_2d1d6893-a5f5-4c56-bf2b-a0d06bac299f.webp',
    '/Apparel Media/Graphic Shirts/13_573a8fd9-df18-4a4a-8614-286aca3020aa.webp',
    '/Apparel Media/Graphic Shirts/13_e4254d87-002f-4bad-bc16-cc91dfd7a549.webp',
    '/Apparel Media/Graphic Shirts/14_4f575194-74cf-46a8-a30f-c5f12d4aed47.webp',
    '/Apparel Media/Graphic Shirts/19b0e500d7df92d7c26ec2f79bbaa7ad4e6d1255_original.jpeg',
    '/Apparel Media/Graphic Shirts/1_fae75773-12f8-4cfb-b728-ecb692347db0.webp',
    '/Apparel Media/Graphic Shirts/1d35e198f8e223ab9d6a02e5b70887ecd3b2016a_original.jpeg',
    '/Apparel Media/Graphic Shirts/1f0cf750b03c959fe74f1b1f69e6c3eac48e619c_original.jpeg',
    '/Apparel Media/Graphic Shirts/2212334119d5b1e7c23ce2933a87b80507bec4ff_original.jpeg',
    '/Apparel Media/Graphic Shirts/229fc590ff10e7b9ffaca0dafde23bec02127f48_original.jpeg',
    '/Apparel Media/Graphic Shirts/30432ee694cd26a811ca0763a50dbf5e2cd35442_original.jpeg',
    '/Apparel Media/Graphic Shirts/3120971c067aafbd18db552fdc646e9884c163a0_original.jpeg',
    '/Apparel Media/Graphic Shirts/34bd7b17dd4a447cc4ad659ad0339a568ab9654a_original.jpeg',
    '/Apparel Media/Graphic Shirts/3bea05c63f35a0300f0f83de45fccd51bf69cd96_original.jpeg',
    '/Apparel Media/Graphic Shirts/41fbxT-63RL._AC_SY350_.jpg',
    '/Apparel Media/Graphic Shirts/425fd0611b13984c20a2ba85148e2e2e52986fd9_original.jpeg',
    '/Apparel Media/Graphic Shirts/45d2698f4f7116b4a769f7e75667b8deb7b073f0_original.jpeg',
    '/Apparel Media/Graphic Shirts/4bc33f1f692df4126efce90594e1edfe01b2eefc_original.jpeg',
    '/Apparel Media/Graphic Shirts/61hfCpmlggL._AC_UY350_.jpg',
    '/Apparel Media/Graphic Shirts/6b0b4bb30a6ccc2e0ae19dd7710ebbc866e2edb3_original.jpeg',
    '/Apparel Media/Graphic Shirts/7161Wm+rozL._AC_SL1500_.jpg',
    '/Apparel Media/Graphic Shirts/782222b1bbb24bae29796f7b1c73f8595c31b3d5_original.jpeg',
    '/Apparel Media/Graphic Shirts/7a415b6043e5e5ac503ddb03708650d63dc72f25_original.jpeg',
    '/Apparel Media/Graphic Shirts/801eb9519edcd0156d1005747fc5a5fac0a4167c_original.jpeg',
    '/Apparel Media/Graphic Shirts/8082eded2de171a58df894d6a4bc6cbc971ee95a_original.jpeg',
    '/Apparel Media/Graphic Shirts/82f34337a9445dda0541c8c83733d27e02d42043_original.jpeg',
    '/Apparel Media/Graphic Shirts/8_c0bc8222-3f8d-40c5-8998-90ba33906ffe.webp',
    '/Apparel Media/Graphic Shirts/8b20efa81409790f122367152144d823270beb77_original (1).jpeg',
    '/Apparel Media/Graphic Shirts/8b20efa81409790f122367152144d823270beb77_original.jpeg',
    '/Apparel Media/Graphic Shirts/8d3ec36a63a7a6707f98463dbdcd4887a5bcba30_original.jpeg',
    '/Apparel Media/Graphic Shirts/8e763fefa6eb4f9c9047cefe9f5702f67d4f87a0_original.jpeg',
    '/Apparel Media/Graphic Shirts/99c2d5e397c308b1a1c1bded07b173e3ccb6175a_original.jpeg',
    '/Apparel Media/Graphic Shirts/9_a6fa3c2d-44ff-4280-bb28-4acef96aaa15.webp',
    '/Apparel Media/Graphic Shirts/InShot-20230827_011528107.webp',
    '/Apparel Media/Graphic Shirts/MGT25R072_2.webp',
    '/Apparel Media/Graphic Shirts/MGT25R325_2.webp',
    '/Apparel Media/Graphic Shirts/MOLORED03603.webp',
    '/Apparel Media/Graphic Shirts/Male Hero image for Graphic Shirts.jpg',
    '/Apparel Media/Graphic Shirts/Model_0b11fe15-417d-46af-87e2-6bd12ef35c34.webp',
    '/Apparel Media/Graphic Shirts/b3e8dbe4241e7b649f20ab0b557ba1106fee6c1e_original.jpeg',
    '/Apparel Media/Graphic Shirts/b4019b11021939d739b41a7653c1e1257958b20f_original.jpeg',
    '/Apparel Media/Graphic Shirts/b677d82ef70a70dedda90ff7340919b2d78cf4cd_original.jpeg',
    '/Apparel Media/Graphic Shirts/b7f2b3f9282b2ac7b84acb204ff613ad9cf86049_original.jpeg',
    '/Apparel Media/Graphic Shirts/b84fd6690aeed0ac8bf8e69fe48c6057b4ed4be3_original.jpeg',
    '/Apparel Media/Graphic Shirts/c805507942004716629b9f23f71cd2a4a1705468_original.jpeg',
    '/Apparel Media/Graphic Shirts/c8804ad4ad67971b3e205aa957ff820592164a8c_original.jpeg',
    '/Apparel Media/Graphic Shirts/ccdd0ef39e66584ec6e6c312c84ecea503569418_original.jpeg',
    '/Apparel Media/Graphic Shirts/d6b3f9f7d8e13093fc3e2dc1c55ac85ab1ceaf3a_original.jpeg',
    '/Apparel Media/Graphic Shirts/dasdsddsadada.jpeg',
    '/Apparel Media/Graphic Shirts/f1866224e55ddd25d4affababab2315ba171f43a_original.jpeg',
    '/Apparel Media/Graphic Shirts/f3953d7c90d4761a0ad35248da2f2491e56bae25_original.jpeg',
    '/Apparel Media/Graphic Shirts/fe9605fb8468a2fbe0f8faffea8d6a9a02b7279f_original.jpeg',
    '/Apparel Media/Graphic Shirts/image.webp',
    '/Apparel Media/Graphic Shirts/images.jfif',
    '/Apparel Media/Graphic Shirts/men-graphic-t-shirts-wholesale.jpg',
    '/Apparel Media/Graphic Shirts/molo-red.webp',
    '/Apparel Media/Graphic Shirts/wekiy_512.webp',
];

const standardColors = ['#000000', '#FFFFFF', '#1A1A2E', '#DC143C', '#556B2F', '#4682B4'];
const vibrantColors = ['#FF4500', '#2E8B57', '#4169E1', '#800080', '#FFD700', '#000000'];

const generateProducts = () => {
    const products: ApparelProduct[] = [];

    // Generate 60 Plain Shirts (increased from 50)
    for (let i = 0; i < 60; i++) {
        products.push({
            id: `p${i + 1}`,
            image: plainImages[i % plainImages.length],
            name: `Plain Series ${String(i + 1).padStart(2, '0')}`,
            price: 1299 + (i % 10) * 100, // Varied prices
            category: 'plain',
            colors: standardColors
        });
    }

    // Generate 60 Pre-Made Shirts (increased from 50)
    for (let i = 0; i < 60; i++) {
        products.push({
            id: `g${i + 1}`,
            image: premadeImages[i % premadeImages.length],
            name: `Graphic Edition ${String(i + 1).padStart(2, '0')}`,
            price: 1499 + (i % 10) * 150, // Varied prices
            category: 'premade',
            colors: vibrantColors
        });
    }

    return products;
};

export const apparelProducts: ApparelProduct[] = generateProducts();
