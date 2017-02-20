var mLab_Url = 'mongodb://raynaldoadp:raynaldoadp@ds139567.mlab.com:39567/raynaldodb';


exports.DATABASE_URL = mLab_Url ||
                       process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                       (process.env.NODE_ENV === 'production' ?
                            'mongodb://localhost/shopping-list' :
                            'mongodb://localhost/shopping-list-dev');
                            
exports.PORT = process.env.PORT || 8080;