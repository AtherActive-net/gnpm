import fetch from "node-fetch";

export const NODE_REGISTRY = "https://registry.npmjs.org";

export async function fetchNpm(url:string,options={}) {
    const req = await fetch(NODE_REGISTRY+url,options);
    if(req.status !== 200) {
        console.log(`Error while fetching ${url}`);
        return null;
    }
    return await req.json();
}

export async function fetchArchive(url:string,options={}) {
    const req = await fetch(url,options);
    if(req.status !== 200) {
        console.log(`Error while fetching ${url}`);
        return null;
    }
    return await req.arrayBuffer();
}