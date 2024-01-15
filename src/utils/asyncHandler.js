// const asyncHandler =(requestHandler)=>{
//     return (req,res,next)=>{
//         Promise.resolve(requestHandler(req,res,next)).
//         catch((err)=>next(err))
//     }
// }

//higher order func execute
const  asyncHandler=(fn)=>async (req,res,next)=>{
    try{
        return await fn(req,res,next)
    }catch(err){
        res.status(err.code || 500).json({
            success:false,
            message:err.message
        })
    }
}
export {asyncHandler}