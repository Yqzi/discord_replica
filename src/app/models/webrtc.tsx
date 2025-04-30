export class WebRTCManager {
    private localStream: MediaStream | null = null;
    private onConnectedCallback: () => void;
    private remoteStream: MediaStream = new MediaStream();
    private peerConnection: RTCPeerConnection | null = null;
    private readonly config: RTCConfiguration;

    constructor(
        private onRemoteStream: (stream: MediaStream) => void,
        private sendSignal: (data: any) => void, // You define how signaling works
        onConnectedCallback: () => void
    ) {
        this.config = {
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }, // free STUN
            ],
        };
        this.onConnectedCallback = onConnectedCallback;
    }

    public async initLocalStream(): Promise<MediaStream> {
        this.localStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
        });
        return this.localStream;
    }

    public async createPeerConnection() {
        this.peerConnection = new RTCPeerConnection(this.config);

        this.localStream?.getTracks().forEach((track) => {
            this.peerConnection!.addTrack(track, this.localStream!);
        });

        this.peerConnection.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                this.remoteStream.addTrack(track);
            });
            this.onRemoteStream(this.remoteStream);
        };

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignal({
                    type: "ice-candidate",
                    candidate: event.candidate,
                });
            }
        };

        // ✅ Listen for actual connection state
        this.peerConnection.onconnectionstatechange = () => {
            if (this.peerConnection?.connectionState === "connected") {
                this.onConnectedCallback(); // ✅ only call when fully connected
            }
        };
    }

    public async createOffer() {
        if (!this.peerConnection) throw new Error("PeerConnection not created");
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        this.sendSignal({ type: "offer", offer });
    }

    public async createAnswer() {
        if (!this.peerConnection) throw new Error("PeerConnection not created");
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.sendSignal({ type: "answer", answer });
    }

    public async handleOffer(offer: RTCSessionDescriptionInit) {
        if (!this.peerConnection) await this.createPeerConnection();
        await this.peerConnection!.setRemoteDescription(
            new RTCSessionDescription(offer)
        );
        await this.createAnswer();
    }

    public async handleAnswer(answer: RTCSessionDescriptionInit) {
        await this.peerConnection!.setRemoteDescription(
            new RTCSessionDescription(answer)
        );
    }

    public async addIceCandidate(candidate: RTCIceCandidateInit) {
        await this.peerConnection?.addIceCandidate(
            new RTCIceCandidate(candidate)
        );
    }

    public closeConnection() {
        this.peerConnection?.close();
        this.peerConnection = null;
        this.remoteStream = new MediaStream();
    }

    public getLocalStream() {
        return this.localStream;
    }

    public getRemoteStream() {
        return this.remoteStream;
    }
}
