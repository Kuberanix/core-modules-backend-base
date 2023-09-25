import dotenv from 'dotenv';
const resolver = () => {
  const NODE_ENV = process.env.NODE_ENV;
  if (NODE_ENV === undefined) {
    const error = new Error('Please provide a environment in scripts');
    console.error(error);
    process.exit(1);
  } else if (NODE_ENV === 'dev' || NODE_ENV === 'development')
    return `.env.${NODE_ENV}`;
  else return '.env';
};
export default dotenv.config({ path: resolver() });
