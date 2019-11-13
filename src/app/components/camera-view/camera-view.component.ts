import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core'
import { from, timer, Observable, } from 'rxjs'
import { take } from 'rxjs/operators'

@Component({
  selector: 'app-camera-view',
  templateUrl: './camera-view.component.html',
  styleUrls: ['./camera-view.component.scss']
})
export class CameraViewComponent implements OnInit {
  @ViewChild("canvas", { static: true }) canvas: TemplateRef<any>
  @ViewChild("video_player", { static: true }) video_player: TemplateRef<any>
  @ViewChild("anchor", { static: true }) anchor: TemplateRef<any>

  constructor() { }
  showVideoPlayer = false
  counter$: Observable<number>
  counter_max_value = 7
  image: any
  should_show = false

  takeImage() {
    //@ts-ignore
    const player = this.video_player.nativeElement
    //@ts-ignore
    const canvas = this.canvas.nativeElement

    const context = canvas.getContext('2d')
    const captureButton = document.getElementById('capture')

    context.drawImage(player, 0, 0, canvas.width, canvas.height)

    //stop camera
    player.srcObject.getVideoTracks().forEach(track => track.stop())
    const image = canvas.toDataURL("image/png")

    this.image = image
    this.showVideoPlayer = false
  }

  downloadImage() {
    //@ts-ignore
    const anchor = this.anchor.nativeElement
    anchor.href = this.image
    anchor.click()
    this.image = undefined
  }

  ngOnInit() { }

  loadVideoPlayer() {
    //@ts-ignore
    let elementRef = this.video_player.nativeElement
    const supported = 'mediaDevices' in navigator
    if (!Boolean(supported)) return

    const constraints = {
      video: true,
    }
    //No need to unsubscribe as it emits only once
    from(navigator.mediaDevices.getUserMedia(constraints))
      .pipe(take(1))
      .subscribe((stream) => {
        elementRef.srcObject = stream
        this.showVideoPlayer = true
      })
  }

  snapPicture() {
    //emits the first value(0) after the first second 
    //and incrimentally emits after every one second.
    this.counter$ = timer(0, 1000).pipe(
      take(this.counter_max_value),
    )
    this.should_show = true

    this.counter$.subscribe({
      complete: () => {
        this.takeImage()
        this.counter$ = undefined
        this.should_show = false
      }
    })
  }

}
