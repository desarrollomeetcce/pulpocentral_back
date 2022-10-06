const sesiones = [];



const getSessionById = (authStrategy) => {
    const client = sesiones.filter(x => x.authStrategy.clientId == authStrategy)
    return client;
};

const getSessions = () => {
    return sesiones;
};

const addSession = (session) => {
    sesiones.push(session);
};

exports.getSessions = getSessions;
exports.addSession = addSession;
exports.getSessionById = getSessionById;
