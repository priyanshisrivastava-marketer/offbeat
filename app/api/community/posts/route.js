import {getAdminAuth,getAdminDb} from "../../../../lib/firebaseAdmin";
import {FieldValue} from "firebase-admin/firestore";
export const dynamic="force-dynamic";
export const runtime="nodejs";

const VIBES=["Food","Chill","Social","Adventurous","Creative","Shopping"];

async function user(req){
  const h=req.headers.get("authorization")||"";
  const t=h.startsWith("Bearer ")?h.slice(7):"";
  if(!t)throw Error("Sign in to use the community board.");
  return getAdminAuth().verifyIdToken(t);
}

const ts=v=>v?.toDate?.()?.toISOString?.()||null;

async function feed(u,vibe="All"){
  const db=getAdminDb();
  const s=await db.collection("community_posts").orderBy("createdAt","desc").limit(50).get();
  const docs=vibe&&vibe!=="All"?s.docs.filter(d=>d.data()?.vibe===vibe):s.docs;
  return Promise.all(docs.map(async d=>{
    const x=d.data()||{};
    const cs=await db.collection("community_posts").doc(d.id).collection("comments").orderBy("createdAt","asc").limit(30).get();
    const comments=cs.docs.map(c=>({id:c.id,...c.data(),createdAt:ts(c.data().createdAt)}));
    let likedByMe=false;
    if(u)likedByMe=(await db.collection("community_posts").doc(d.id).collection("likes").doc(u.uid).get()).exists;
    return {id:d.id,...x,createdAt:ts(x.createdAt),comments,likedByMe,likeCount:Number(x.likeCount||0)};
  }));
}

export async function GET(req){
  try{
    let u=null;
    const h=req.headers.get("authorization")||"";
    if(h.startsWith("Bearer "))try{u=await getAdminAuth().verifyIdToken(h.slice(7))}catch{}
    const vibe=new URL(req.url).searchParams.get("vibe")||"All";
    return Response.json({posts:await feed(u,VIBES.includes(vibe)?vibe:"All")});
  }catch(e){
    console.error(e);
    return Response.json({error:"Could not load community posts."},{status:500});
  }
}

export async function POST(req){
  try{
    const u=await user(req),b=await req.json(),db=getAdminDb(),action=String(b?.action||"create");
    if(action==="create"){
      const mediaUrl=String(b?.mediaUrl||"").trim();
      const mediaType=b?.mediaType==="video"?"video":"image";
      const caption=String(b?.caption||"").trim().slice(0,500);
      const vibe=String(b?.vibe||"").trim();
      if(!/^https:\/\//i.test(mediaUrl))return Response.json({error:"A valid uploaded media file is required."},{status:400});
      if(!VIBES.includes(vibe))return Response.json({error:"Choose a vibe before publishing."},{status:400});
      const r=await db.collection("community_posts").add({
        authorId:u.uid,
        authorName:u.name||u.email?.split("@")[0]||"Offbeat explorer",
        mediaUrl,
        mediaType,
        caption,
        vibe,
        likeCount:0,
        createdAt:FieldValue.serverTimestamp()
      });
      return Response.json({post:{
        id:r.id,
        authorId:u.uid,
        authorName:u.name||u.email?.split("@")[0]||"Offbeat explorer",
        mediaUrl,
        mediaType,
        caption,
        vibe,
        likeCount:0,
        likedByMe:false,
        comments:[],
        createdAt:new Date().toISOString()
      }});
    }
    const id=String(b?.postId||"").trim();
    if(!id)return Response.json({error:"Missing post."},{status:400});
    const pr=db.collection("community_posts").doc(id),p=await pr.get();
    if(!p.exists)return Response.json({error:"Post not found."},{status:404});
    if(action==="like"){
      const lr=pr.collection("likes").doc(u.uid),l=await lr.get(),liked=l.exists;
      if(liked){await lr.delete();await pr.update({likeCount:FieldValue.increment(-1)})}
      else{await lr.set({createdAt:FieldValue.serverTimestamp()});await pr.update({likeCount:FieldValue.increment(1)})}
      const fresh=await pr.get();
      return Response.json({liked:!liked,likeCount:Number(fresh.data()?.likeCount||0)});
    }
    if(action==="comment"){
      const text=String(b?.text||"").trim().slice(0,300);
      if(!text)return Response.json({error:"Write a comment first."},{status:400});
      const r=await pr.collection("comments").add({authorId:u.uid,authorName:u.name||u.email?.split("@")[0]||"Offbeat explorer",text,createdAt:FieldValue.serverTimestamp()});
      return Response.json({comment:{id:r.id,authorName:u.name||u.email?.split("@")[0]||"Offbeat explorer",text,createdAt:new Date().toISOString()}});
    }
    return Response.json({error:"Unknown community action."},{status:400});
  }catch(e){
    console.error(e);
    const status=e?.message?.startsWith("Sign in")?401:500;
    return Response.json({error:status===401?e.message:"Could not update the community board."},{status});
  }
}
