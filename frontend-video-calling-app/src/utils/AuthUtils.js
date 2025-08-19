export const setAccessToken = (token) => {
    localStorage.setItem('accessToken', token);
}


export const getAccessToken = () => {
    localStorage.getItem('accessToken');
}



export const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
};