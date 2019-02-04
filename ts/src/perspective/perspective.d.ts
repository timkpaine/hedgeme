export enum ViewOption {
  VIEW = 'view',
  INDEX = 'index',
  COLUMNS = 'columns',
  ROW_PIVOTS = 'row-pivots',
  COLUMN_PIVOTS = 'column-pivots',
  AGGREGATES = 'aggregates',
  SORT = 'sort',
  SETTINGS = 'settings'
}


export
function view_string_to_view_option(option: string): ViewOption {
  switch(option){
    case 'view': {
      return ViewOption.VIEW;
    }
    case 'index': {
      return ViewOption.INDEX;
    }
    case 'columns': {
      return ViewOption.COLUMNS;
    }
    case 'row-pivots': {
      return ViewOption.ROW_PIVOTS;
    }
    case 'column-pivots': {
      return ViewOption.COLUMN_PIVOTS;
    }
    case 'aggregates': {
      return ViewOption.AGGREGATES;
    }
    case 'sort': {
      return ViewOption.SORT;
    }
    case 'settings': {
      return ViewOption.SETTINGS;
    }
    default: {
      throw 'option not recognized';
    }
  }
}

export type ViewSettings = {
  [ key in ViewOption ]?: string;
}

export enum DataOption {
  DELETE = 'delete',
  WRAP = 'wrap',
  KEY = 'key'
}

// function data_string_to_data_option(option: string): DataOption {
//   switch(option){
//     case 'delete': {
//       return DataOption.DELETE;
//     }
//     case 'wrap': {
//       return DataOption.WRAP;
//     }
//     default: {
//       throw 'option not recognized';
//     }
//   }
// }

export type DataSettings = {
  [ key in DataOption ]?: boolean | string;
}


// TODO pull from perspective/types
export enum TypeNames {
  STRING = 'string',
  FLOAT = 'float',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  DATETIME = 'date'
}

// TODO pull from perspective/types
export type Schema = {
  [ key: string ]: TypeNames;
}

