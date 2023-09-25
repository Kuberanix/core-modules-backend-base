const users = [
  { name: 'ABc', age: 17 },
  { name: 'DEF', age: 19 },
];
function GET(req, res) {
  return res.status(200).json(users);
}
export { GET as GETUSERS };
