


export const generateUrl = (item) => {
    if(!item) return "/";
    
    if(item.type === "ticket_received") {
        return `/tickets?comment_taskId=${item?.taskId}`;

    } else {
        return `${item?.redirectLink}?comment_taskId=${item?.taskId}`;
    }

    
}