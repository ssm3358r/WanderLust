

const mongoose =require("mongoose");
const initData=require("./data.js");
const Listing =require("../Models/listing.js")


const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";


const AtlasUrl=process.env.ATLAS_URL;
async function main() {
  await mongoose.connect(MONGO_URL);

}
main().then((res)=>{
    console.log("connected to database successfuly");
    
}).catch(err => console.log(err));

const initDB=async ()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({
      ...obj,owner:'68d0d236bb0c4dd136412b15'
    }))
    await Listing.insertMany(initData.data);
    console.log('Data was initialized');
    
}
initDB();
