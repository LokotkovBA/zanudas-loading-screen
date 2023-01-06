export function getBackendAddress(): string{
    if(process.env.REACT_APP_BACKEND_ADDRESS){
        return process.env.REACT_APP_BACKEND_ADDRESS;
    }
    return 'localhost';
};
