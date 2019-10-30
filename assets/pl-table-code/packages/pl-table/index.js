import './revise-el-table-mixins'
import PlTable from './src/plTable';

PlTable.install = function(Vue) {
  Vue.component('plTable', PlTable);
};

export default PlTable;
