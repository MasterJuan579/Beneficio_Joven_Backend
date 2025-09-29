exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'API Beneficio Joven funcionando',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    })
  };
};