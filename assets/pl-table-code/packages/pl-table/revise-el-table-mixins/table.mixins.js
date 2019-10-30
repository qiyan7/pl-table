export default {
  props: {
    rowHeight: {
      type: Number,
      default: 60
    },
    excessRows: {
      type: Number,
      default: 3
    },
    headerDragStyle: {
      type: Boolean,
      default: false
    },
    headerDragShow: {
     type: Boolean,
     default: false
    },
    tooltipPlacement: {
      default: 'top',
      type: String
    },
    addfence: {
      type: Boolean,
      default: false
    },
    fenceMethod: Function,
    useVirtual: {
      type: Boolean,
      default: false
    },
    // 大数据下是否更改全选框，单选框卡顿问题
    bigDataCheckbox: {
      type: Boolean,
      default: false
    },
    // 开启了thtd超出隐藏
    thtdBeyondHiding: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      scrollTop: 0,
      innerTop: 0,
      start: 0,
      end: 0
    }
  },
  computed: {
    visibleCount () {
      return Math.ceil(parseFloat(this.height) / this.rowHeight)
    },

    virtualBodyHeight () {
      const {data} = this.store.states
      return data ? data.length * this.rowHeight : 0
    }
  },
  watch: {
    scrollTop: {
      immediate: true,
      handler (top) {
        this.computeScrollToRow(top)
      }
    },

    useVirtual: {
      immediate: true,
      handler(newVal) {
        // 把当前状态存入store.states里面
        this.store.states.useVirtual = newVal
      }
    },

    bigDataCheckbox: {
      immediate: true,
      handler(newVal) {
        // 把当前状态存入store.states里面
        this.store.states.bigDataCheckbox = newVal
      }
    },

    virtualBodyHeight () {
      if (this.useVirtual) setTimeout(this.doLayout, 10)
    },

    height (val) {
      if (this.useVirtual) this.computeScrollToRow(this.scrollTop)
    }
  },
  mounted () {
    // 暴露store对象对pl-table
    this.$parent.newTableStore = this.store
    if (this.useVirtual) {
      this.bindEvent('bind')
    }
  },
  methods: {
    bindEvent (action) {
      const tableBodyWrapper = this.$el.querySelector('.el-table__body-wrapper')
      if (!this.binded && action === 'bind') {
        tableBodyWrapper.addEventListener('scroll', this.handleScroll)
        this.binded = true
      } else if (this.binded && action === 'unbind') {
        tableBodyWrapper.removeEventListener('scroll', this.handleScroll)
        this.binded = false
      }
    },

    // 表体滚动到什么位置
    pagingScrollTop (top) {
      const tableBodyWrapper = this.$el.querySelector('.el-table__body-wrapper')
      if (tableBodyWrapper) {
        tableBodyWrapper.scrollTop = top
        tableBodyWrapper.scrollLeft = 0
      }
    },

    computeScrollToRow (scrollTop) {
      let startIndex = parseInt(scrollTop / this.rowHeight)

      const { start, end } = this.getVisibleRange(startIndex)

      this.$parent.position = {
        start: start,
        end: end
      }

      this.start = start
      this.end = end
      this.innerTop = this.start * this.rowHeight
    },

    getVisibleRange (expectStart) {
      const start = expectStart - this.excessRows

      return {
        start: start >= 0 ? start : 0,
        end: expectStart + this.visibleCount + this.excessRows
      }
    },

    handleScroll (e) {
      const ele = e.srcElement || e.target
      let { scrollTop } = ele
      const bodyScrollHeight = this.visibleCount * this.rowHeight

      // 解决 滚动时 行hover高亮的问题
      this.store.states.hoverRow = null

      if (this.virtualBodyHeight < scrollTop + bodyScrollHeight) {
        scrollTop = this.virtualBodyHeight - bodyScrollHeight
      }

      this.scrollTop = scrollTop

      // 当表格滚动暴露滚动事件
      this.$emit('tableBodyScroll', this, e)
    }
  },
  activated () {
    if (this.useVirtual) {
      this.scrollTop = 0
      this.bindEvent('bind')
    }
  },
  deactivated () {
    if (this.useVirtual) {
      this.bindEvent('unbind')
    }
  },
  beforeDestroy () {
    if (this.useVirtual) {
      this.bindEvent('unbind')
    }
  }
}
