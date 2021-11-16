export default async context => {
  return { id: context.request.params.userId }
}
