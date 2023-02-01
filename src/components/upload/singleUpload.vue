<template>
  <div>
    <el-upload
      :action="signedUrl"
      list-type="picture"
      :multiple="false" :show-file-list=true
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-preview="handlePreview"
      :http-request="uploadToS3">
      <el-button size="small" type="primary">Click to Upload</el-button>
      <div slot="tip" class="el-upload__tip">Only jpg/png, less than 10kb</div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="fileList[0].url" alt="" v-if="fileList.length > 0">
    </el-dialog>
  </div>
</template>
<script>
import {policy} from './policy'
import axios from 'axios'

export default {
  name: 'singleUpload',
  data () {
    return {
      dataObj: {
        policy: 'PublicAccessS3BucketPolicy'
      },
      dialogVisible: false,
      signedUrl: '',
      logo: '',
      fileList: []
    }
  },
  methods: {
    uploadToS3 (file) {
      console.log('enter s3 ----!!!!!!!!!!!!', file.file.name)
      console.log(file)
      let config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }

      axios.put(this.signedUrl, file.file, config)
        .then(res => {
          console.log('upload succeed', res)
          console.log('Put File: ', file.file)
          console.log('SignedUrl', this.signedUrl)
          var name = file.file.name
          var url = this.getUrl(this.signedUrl)
          this.fileList.push({name: name, url: url})
          this.logo = url
          console.log('puts->logo: ', this.logo)
          console.log('FileList: ', this.fileList)
          this.handleUploadSuccess(res, file.file)
        }).catch(
        err => {
          console.log(err)
        }
      )
    },
    emitInput (val) {
      console.log('emitInptut....')
      this.$emit('input', val)
    },
    handleRemove (file, fileList) {
      this.emitInput('')
    },
    handlePreview (file) {
      console.log('Preview: ', file)
      this.dialogVisible = true
    },
    beforeUpload (file) {
      console.log('BeforeUpload', this)
      let _self = this
      return new Promise((resolve, reject) => {
        policy(file).then(response => {
          _self.signedUrl = response.presignedURL
          resolve(true)
        }).catch()
      })
    },
    handleUploadSuccess (res, file) {
      console.log('Upload successful')
      this.showFileList = true
      this.emitInput(this.getUrl(this.fileList[0].url))
    },
    getUrl (signedUrl) {
      var urlInfo = signedUrl.split('?')
      let url = urlInfo[0]
      return url
    }
  }
}
</script>
<style>

</style>


