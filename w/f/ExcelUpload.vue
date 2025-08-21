<!--
Program: Excel Upload
Author: SDL
Description: Excel Upload Common Component
-->
<template>
  <div class="input-group">
    <input type="file" class="form-control" @change="onChange" />
    <button type="button" :class="btnClass" @click="onBeforeUpload">{{ $t(btnLabel) }}</button>
  </div>
</template>
<script>
import axios from 'axios';
import SDLUtil from '@/utils/SDLUtil';

export default {
  props: {
    btnLabel: {
      required: false,
      type: String,
      default: 'sdl.common.label.excelUpload',
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
    return {
      files: [],
    };
  },
  methods: {
    /**
     * param: event
     * return:
     * exception:
     * Description : Select attachment
     */
    onChange(e) {
      this.files = e.target.files || e.dataTransfer.files;

      const getFileExt = fileName => fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length).toLowerCase();
      const extList = 'xls|xlsx'.split('|');

      Object.keys(this.files).forEach(x => {
        if (!extList.includes(getFileExt(this.files[x].name))) {
          SDLUtil.alert(
            SDLUtil.getMsgProp('sdl.common.message.extensionCannotBeAttached', [`${getFileExt(this.files[x].name)}`]),
          );
          this.files = [];
          e.target.value = '';
        }
      });
    },
    /**
     * param:
     * return:
     * exception:
     * Description : click upload button
     */
    onBeforeUpload() {
      if (this.files.length === 0) {
        SDLUtil.alert('sdl.common.message.selectFile');
        return;
      }
      if (!this.beforeClick()) return;

      SDLUtil.confirm({
        msg: 'sdl.common.message.wouldYouLikeUploadExcel',
        // title: 'confirm title',
        // okLabel: 'ok label',
        // cancelLabel: 'Cancel',
        onOkEvt: () => this.upload(),
      });
    },
    /**
     * param:
     * return:
     * exception:
     * Description : upload attachment
     */
    upload() {
      this.excelInfo.columnInfoFile = encodeURIComponent(this.excelInfo.columnInfoFile);
      const formData = new FormData();
      formData.append('excelFile', this.files[0]);

      Object.keys(this.excelInfo).forEach(val => {
        formData.append(val, this.excelInfo[val]);
      });

      SDLUtil.showLoadingBar(true);
      axios
        .post(`${SDLUtil.API_URL}/excel/excel-upload`, formData)
        .then(response => {
          // Loading bar hidden
          SDLUtil.showLoadingBar(false);
          // if (response.data !== '') {
          //   this.$router.push(response.data);
          // }
          this.$emit('after-upload', response.data);
        })
        .catch(error => {
          SDLUtil.showLoadingBar(false);
          console.log(error);
        });
    },
  },
};
</script>
<style></style>
