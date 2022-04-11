import { BASE_INDENTATION, BASE_INDENTATION_COUNT, config, toCamel } from '../tools'


function getRegxKeyword(keyWords:string[]){
  return new RegExp(`.*(${keyWords.join('|')})`)
}
function getName(path:string='',method:string='get',des:string=''){
  path = typeof path === 'string'?path : '';
  method = typeof method === 'string'?method.toLowerCase() : 'get';
  let preStr = '';
  let afterStr = '';

  if( method=== 'post'){
    preStr = 'Create'
  }
  if( method=== 'put'){
    preStr = 'Update'
  }



  if(getRegxKeyword(['改变' , '变更']).test(des)){
    preStr='Change'
  }
  if(getRegxKeyword(['结束']).test(des)){
    preStr='Finish'
  }

  if(getRegxKeyword(['列出','分页' , '搜索' ,'列表' , '查询']).test(des) && method === 'get'){
    afterStr='Page'
  }
  if(getRegxKeyword(['创建' , '增加' , '添加']).test(des)){

    preStr='Create'
  }
  if(getRegxKeyword(['更新']).test(des)){
    preStr='Update'
  }
  if(getRegxKeyword(['提交']).test(des)){
    preStr='Submit'
  }
  if(getRegxKeyword(['移除']).test(des)){
    preStr='Delete'
  }
  if( method=== 'get'){
    preStr = 'Get'
  }
  if(method=== 'delete'){
    preStr = 'Delete'
  }

  const { ignorePath = '' } = config?.extConfig
  let rawIgnoreList:any = Array.isArray(ignorePath)?ignorePath:[ignorePath];
  const ignoreList = rawIgnoreList.map((it:string) => toDown(toHump(it.replace(/\//g,'_'))))



  let find = ignorePath?ignoreList.find((it:any) => it && toHump(path).startsWith(it || '')):''
  const newPath = path

  let findIndex = newPath.indexOf('$');
  let findLastIndex = newPath.lastIndexOf('$');

  let  newStr = findIndex >= 0 ?newPath.substring(0,findIndex):newPath;

  if(findLastIndex >= 0 && findLastIndex !== findIndex ){
    newStr = newStr + newPath.substring(findLastIndex + 1,newPath.length)
  }
  let params:any = findIndex >= 0?newPath.substring(findIndex,findLastIndex).split('$'):[];
  let paramsStr ='';

  (Array.isArray(params)?params : []).forEach((it:string,idx:number) => {
    it = it || ''
    const lowIt = it.toLowerCase()
    if(lowIt === 'put' || lowIt === 'get' || lowIt === 'post' || lowIt === 'delete'){
      return
    }
    if(!paramsStr){
      paramsStr = 'By'
    }
    paramsStr = paramsStr + toUp(toHump(it || ''))
  })

  let name = toUp(toHump(newStr || '')).replace(toUp(find || ''),'') || ''
  name = name?.replace(toUp(method),'')
  name = name?.replace(preStr,'')
  name = name?.replace(afterStr,'')
  const nameList = getCamelList(name)
  let ob = {}
  let newName = ''
  nameList.reverse().forEach((it) => {

    if(!ob[it] || it?.length <= 3){
      newName = it + newName
    }
    ob[it] = true;
  })
  return  'I' + preStr +  newName + afterStr + paramsStr

}

/**
 * 渲染 Typescript Interface
 * @param data
 * @returns
 */
export function renderToInterface(data: TreeInterface): string {
  // const name = data.operationId.replace('_', '')
  const name = data.pathName

  const paramsArr = removeEmptyLines(parseParams(data.params, 1))
  const resArr = removeEmptyLines(parseResponse(data.response, 1))

  let content = paramsArr
  if (content.length) content.push('')
  content = content.concat(resArr)
  const formatName = getName(data.pathName,data.method,data.title)

  const lines: string[] = [...parseHeaderInfo(data), ...parseNameSpace(formatName, content), '']

  return lines.join('\n')
}

/**
 * 解析命名空间
 * @param name
 * @param content
 * @param indentation
 */
function parseNameSpace(name: string, content: string[], indentation = 0): string[] {
  const indentationSpace = handleIndentation(indentation)
  return [
    `${indentationSpace}declare namespace ${name} {`,
    ...content.map((v) => `${indentationSpace}${v}`),
    `${indentationSpace}}`,
  ]
}

/**
 * 解析参数接口
 * @param params
 * @param indentation
 */
function parseParams(
  params: TreeInterfaceParamsItem[] | TreeInterfacePropertiesItem | string,
  indentation = 0
): string[] {
  const res = parseProperties('Params', params, indentation)
  // res.pop() // 删除多余空行
  return res
}

/**
 * 解析返回结果
 * @param response
 * @param indentation
 */
function parseResponse(
  response: TreeInterfacePropertiesItem | TreeInterfacePropertiesItem[] | string,
  indentation = 0
): string[] {
  const res = parseProperties('Response', response, indentation)
  // res.pop() // 删除多余空行
  return res
}

/**
 * 解析详细属性
 * @param properties
 * @param indentation
 */
function parseProperties(
  interfaceName: string,
  properties: TreeInterfacePropertiesItem | TreeInterfacePropertiesItem[] | string | undefined,
  indentation = 0
): string[] {
  interfaceName =   toHump(interfaceName);
  const indentationSpace = handleIndentation(indentation) // 一级缩进
  const indentationSpace2 = handleIndentation(indentation + 1) // 二级缩进
  const interfaceList = []
  let content: string[] = []

  if (Array.isArray(properties)) {
    if (properties.length === 1 && properties[0].name === '____body_root_param____') {
      let type = properties[0].type
      if (type === 'array') {
        type = `${type === 'array' ? handleType(properties[0].items?.type) : type}[]`
      }

      const description: string = properties[0].description
        ? `${indentationSpace}/** ${properties[0].description} */\n`
        : ''

      interfaceList.push(`${description}${indentationSpace}type ${interfaceName} = ${type}`, '')
      return interfaceList
    }

    content = properties.map((v) => {
      let type = handleType(v.type)
      if (v.item) {
        type = `${interfaceName}${toUp(v.name)}`
        if (v.type === 'array') type = `${type}Item`


        interfaceList.push(...parseProperties(type, v.item, indentation))
      }

      try {
        // @ts-ignore
        if (!v.item.properties.length) type = 'Record<string, unknown>'
      } catch (error) {
        // console.warn(error)
      }

      if (v.enum) {
        type = parseEnumToUnionType(v.enum)
      } else if (v.items?.enum) {
        type = parseEnumToUnionType(v.items.enum)
      }

      if (v.type === 'array') {
        if ((v.enum || v.items?.enum) && type !== 'any') {
          type = `(${type})`
        }
        type = `${type === 'array' ? handleType(v.itemsType || 'any') : type}[]`
      }

      let defaultValDesc = v.default || v.items?.default || ''
      if (typeof defaultValDesc === 'object') {
        defaultValDesc = JSON.stringify(defaultValDesc)
      }
      if (defaultValDesc) {
        defaultValDesc = `[default:${defaultValDesc}]`
      }

      let description: string = v.description || ''
      if (defaultValDesc) {
        description = description ? `${description} -- ${defaultValDesc}` : defaultValDesc
      }
      if (description) {
        description = `${indentationSpace2}/** ${description} */\n`
      }
      type = toHump(type)
      const { propertiesCase = '' } = config?.extConfig
      const propertiesName =  propertiesCase=== 'camel'?toDown(toHump(v.name)): v.name

      return `${description}${indentationSpace2}${propertiesName}${v.required ? ':' : '?:'} ${type}`
    })
  } else if (typeof properties === 'object') {
    let arr: TreeInterfacePropertiesItem[] = []

    if (properties.properties && Array.isArray(properties.properties)) arr = properties.properties
    if (properties.item && Array.isArray(properties.item)) arr = properties.item

    if (arr.length) {

      let str =`${interfaceName}${toUp(properties.name)}`


      interfaceList.push(...parseProperties(str, arr, indentation))
    }
  } else if (typeof properties === 'string') {
    interfaceList.push(`${indentationSpace}type ${interfaceName} = ${handleType(properties)}`, '')
  }

  if (content.length) {
    interfaceList.push(`${indentationSpace}interface ${interfaceName} {`, ...content, `${indentationSpace}}`, '')
  }

  return interfaceList
}

/**
 * 解析头部信息
 * @param data
 */
function parseHeaderInfo(data: TreeInterface): string[] {
  return [
    '/**',
    ` * @name   ${data.title || ''} (${data.groupName})`,
    ` * @base   ${data.basePath || ''}`,
    ` * @path   ${data.path}`,
    ` * @method ${data.method.toUpperCase()}`,
    ` * @update ${new Date().toLocaleString()}`,
    ' */',
    '',
  ]
}

/**
 * 处理缩进层级
 * @param indentation
 */
function handleIndentation(indentation = 0): string {
  return new Array(indentation * BASE_INDENTATION_COUNT + 1).join(BASE_INDENTATION)
}

/**
 * 首字母大写
 * @param {String} str
 */
function toUp(str: string) {
  if (typeof str !== 'string') return ''
  return str.slice(0, 1).toUpperCase() + str.slice(1)
}
/**
 * 首字母小写写
 * @param {String} str
 */
function toDown(str: string) {
  if (typeof str !== 'string') return ''
  return str.slice(0, 1).toLowerCase() + str.slice(1)
}

/**
 * 处理数据类型
 * @param type
 */
export function handleType(type?: string): string {
  switch (type) {
    case 'integer':
      return 'number'

    case 'file':
      return 'File'

    case 'ref':
      return 'any // BUG: Type Error (ref)'

    case 'object':
      return 'Record<string, any>'

    default:
      return type || 'any'
  }
}

/**
 * 将枚举类型解析为联合
 * @param name
 * @param enumArr
 * @param indentation
 * @returns
 */
function parseEnumToUnionType(enumArr?: string[]): string {
  if (!enumArr || !enumArr.length) return 'any'
  return `${enumArr.map((v) => `'${v}'`).join(' | ')}`
}

/**
 * 删除多余空行
 * @param arr
 * @returns
 */
function removeEmptyLines(arr: string[]): string[] {
  if (arr[0] === '') {
    arr.shift()
    if (arr[0] === '') return removeEmptyLines(arr)
  }

  if (arr[arr.length - 1] === '') {
    arr.pop()
    if (arr[arr.length - 1] === '') return removeEmptyLines(arr)
  }

  return arr
}
function toHump(name:string) {
  return name.replace(/\_(\w)/g, function(all, letter){
    return letter.toUpperCase();
  });
}

function getCamelList(str:string){
  return str.replace(/([A-Z])/g,"_$1").split('_')
}