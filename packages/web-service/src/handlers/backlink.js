export function Backlink (func) {
  this.get = async function (p) {
    const value = await func(p)
    return {
      enabled: !!value,
      ...(value && { value })
    }
  }
  this.value = async function (p) {
    return func(p)
  }
}

Backlink.JAVASCRIPT = new Backlink(() => 'javascript: window.history.go(-1)')
Backlink.NO_BACKLINK = new Backlink(() => null)
Backlink.URI = s => new Backlink(() => `javascript: window.location.href = '${s}'`)
