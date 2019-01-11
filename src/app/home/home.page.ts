import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
  Camera,
  CameraOptions,
  PictureSourceType
} from "@ionic-native/camera/ngx";
import {
  ActionSheetController,
  ToastController,
  Platform,
  LoadingController
} from "@ionic/angular";
import { File, FileEntry } from "@ionic-native/file/ngx";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { WebView } from "@ionic-native/ionic-webview/ngx";
import { Storage } from "@ionic/storage";

import { finalize, map } from "rxjs/operators";

const STORAGE_KEY = "my_images";
const headers = new HttpHeaders().set("X-CustomHttpHeader", "CUSTOM_VALUE");
const xUrl = "http://8.8.8.117:80/ionic/view.php";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage implements OnInit {
  images = [];
  img_data;

  constructor(
    private camera: Camera,
    private file: File,
    private http: HttpClient,
    private webview: WebView,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private storage: Storage,
    private plt: Platform,
    private loadingController: LoadingController,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.plt.ready().then(() => {
      this.loadStoredImages();
    });

    this.getImagesFromServer();
  }

  loadStoredImages() {
    this.storage.get(STORAGE_KEY).then(images => {
      if (images) {
        let arr = JSON.parse(images);
        this.images = [];
        for (let img of arr) {
          let filePath = this.file.dataDirectory + img;
          let resPath = this.pathForImage(filePath);
          this.images.push({ name: img, path: resPath, filePath: filePath });
        }
      }
    });
  }

  pathForImage(img) {
    if (img == null) {
      return "";
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }

  async presentToast(text) {
    const toast = await this.toastController.create({
      message: text,
      position: "bottom",
      duration: 3000
    });
    toast.present();
  }

  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: "Select image source",
      buttons: [
        {
          text: "load from library",
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: "Use Camera",
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: "Cancel",
          role: "cancel"
        }
      ]
    });

    await actionSheet.present();
  }

  takePicture(sourceType: PictureSourceType) {
    var options: CameraOptions = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    this.camera.getPicture(options).then(imagePath => {
      var currentName = imagePath.substr(imagePath.lastIndexOf("/") + 1);
      var correctPath = imagePath.substr(0, imagePath.lastIndexOf("/") + 1);
      this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
    });
  }

  createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }

  copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file
      .copyFile(namePath, currentName, this.file.dataDirectory, newFileName)
      .then(
        success => {
          this.updateStoredImages(newFileName);
          this.presentToast("Success: " + JSON.stringify(success));
        },
        error => {
          this.presentToast(
            "Error while storing file. " + JSON.stringify(error)
          );
        }
      );
  }

  updateStoredImages(name) {
    this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      if (!arr) {
        let newImages = [name];
        this.storage.set(STORAGE_KEY, JSON.stringify(newImages));
      } else {
        arr.push(name);
        this.storage.set(STORAGE_KEY, JSON.stringify(arr));
      }

      let filePath = this.file.dataDirectory + name;
      let resPath = this.pathForImage(filePath);

      let newEntry = {
        name: name,
        path: resPath,
        filePath: filePath
      };

      this.images = [newEntry, ...this.images];
      this.ref.detectChanges(); // trigger change detection cycle
    });
  }

  deleteImage(imgEntry, position) {
    this.images.splice(position, 1);

    this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      let filtered = arr.filter(name => name != imgEntry.name);
      this.storage.set(STORAGE_KEY, JSON.stringify(filtered));

      var correctPath = imgEntry.filePath.substr(
        0,
        imgEntry.filePath.lastIndexOf("/") + 1
      );

      this.file.removeFile(correctPath, imgEntry.name).then(res => {
        this.presentToast("File removed.");
      });
    });
  }

  startUpload(imgEntry) {
    this.file
      .resolveLocalFilesystemUrl(imgEntry.filePath)
      .then(entry => {
        (<FileEntry>entry).file(file => this.readFile(file));
      })
      .catch(err => {
        this.presentToast("Error while reading file.");
      });
  }

  readFile(file: any) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const formData = new FormData();
      const imgBlob = new Blob([reader.result], {
        type: file.type
      });
      formData.append("file", imgBlob, file.name);
      this.uploadImageData(formData);
    };
    reader.readAsArrayBuffer(file);
  }

  async uploadImageData(formData: FormData) {
    const loading = await this.loadingController.create({
      message: "Uploading image..."
    });
    await loading.present();

    this.http
      .post("http://8.8.8.117:80/ionic/upload.php", formData)
      .pipe(
        finalize(() => {
          loading.dismiss();
        })
      )
      .subscribe(
        res => {
          if (res["success"]) {
            alert("File upload complete." + JSON.stringify(res["message"]));
          } else {
            alert("File upload failed." + JSON.stringify(res["message"]));
          }
        },
        error => {
          alert(JSON.stringify(error));
        }
      );
  }

  READfromSERVER() {
    return this.http.get(xUrl);
  }

  getImagesFromServer() {
    // this.READfromSERVER().subscribe(data => {
    //   // this.img_data = data;
    //   console.log(JSON.stringify(data["xpath"]));
    // });
  }

  downloadImg() {
    //let pictureUrl = "http://8.8.8.117:80/ionic/uploads/1547013241449.jpg";
    let pictureUrl = "http://8.8.8.117:80/ionic/view.php";
    this.http.get(pictureUrl, { responseType: "arraybuffer" }).subscribe(
      (imageBlob: any) => {
        return this.file
          .writeFile(
            this.file.externalDataDirectory,
            "my_downloaded_image.jpg",
            imageBlob,
            { replace: true }
          )
          .then(file => {})
          .catch(err => {
            alert(JSON.stringify("Error 1: " + err));
          });
      },
      error => {
        alert(JSON.stringify("Error 2: " + error));
        console.log(error);
      }
    );
  }
}
