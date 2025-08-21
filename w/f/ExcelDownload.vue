<!--
Program: Excel Download
Author: SDL
Description: Excel Download Common Component
-->
<template>
  <button type="button" :class="btnClass" @click="excelDownload()">{{ $t(btnLabel) }}</button>
</template>
<script>
import axios from 'axios';
import SDLUtil from '@/utils/SDLUtil';

export default {
  props: {
    btnLabel: {
      required: false,
      type: String,
      default: 'sdl.common.label.excelDownload',
    },
    btnClass: {
      type: String,
      default: 'btn btn-secondary',
    },
    excelInfo: {
      required: false,
      type: Object,
    },
    beforeClick: {
      type: Function,
      default: () => true,
    },
  },
  data() {
    return {};
  },
  methods: {
    /**
     * param:
     * return:
     * exception:
     * Description : click excel down
     */
    excelDownload() {
      if (!this.beforeClick()) return;

      SDLUtil.confirm({
        msg: 'sdl.common.message.doExcelDownload',
        // title: 'confirm title',
        // okLabel: 'ok label',
        // cancelLabel: 'Cancel',
        onOkEvt: () => this.download(),
      });
    },
    /**
     * param:
     * return:
     * exception:
     * Description : execute download
     */
    download() {
      const getFileName = contentDisposition => {
        const fileName = contentDisposition
          .split(';')
          .filter(ele => ele.indexOf('filename') > -1)
          .map(ele => ele.replace(/"/g, '').split('=')[1]);
        return fileName[0] ? fileName[0] : null;
      };

      SDLUtil.showLoadingBar(true);

      const param = [];
      const encodeList = ['columnInfoFile', 'fileName', 'sheetName', 'param'];
      Object.keys(this.excelInfo).forEach(val => {
        if (encodeList.includes(val)) {
          if (val === 'param') {
            param.push(`${val}=${encodeURIComponent(JSON.stringify(this.excelInfo[val]))}`);
          } else {
            param.push(`${val}=${encodeURIComponent(this.excelInfo[val])}`);
          }
        } else {
          param.push(`${val}=${this.excelInfo[val]}`);
        }
      });

      axios({
        url: `${SDLUtil.API_URL}/excel/excel-download?${param.join('&')}`,
        responseType: 'arraybuffer',
        method: 'get',
      })
        .then(response => {
          try {
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            let fileName = '';
            if (response.headers['content-disposition']) {
              fileName = getFileName(response.headers['content-disposition']);
            } else {
              // eslint-disable-next-line prefer-destructuring
              fileName = this.excelInfo.fileName;
            }

            fileName = decodeURI(fileName); // File name decoding (option of use according to project)

            if (window.navigator.msSaveOrOpenBlob) {
              // IE 10+
              window.navigator.msSaveOrOpenBlob(blob, fileName);
            } else {
              // not IE
              const link = document.createElement('a');
              link.href = window.URL.createObjectURL(blob);
              link.target = '_self';
              if (fileName) link.download = fileName;
              link.click();
            }
            SDLUtil.showLoadingBar(false);
            // return response.data;
          } catch (e) {
            SDLUtil.showLoadingBar(false);
            console.error(e);
          }
        })
        .catch(response => {
          SDLUtil.showLoadingBar(false);
          SDLUtil.alert(response.data);
        });
    },
  },
};
</script>
<style></style>
