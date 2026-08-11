import type { CDModuleContent } from "../types";

/**
 * Module 3 — Docker & Kubernetes.
 * Senior-level focus: how containers run in production and how to reason about
 * the common failure modes (503s, crash loops, scaling) under interview
 * pressure.
 */
export const dockerKubernetesContent: CDModuleContent = {
  slug: "docker-kubernetes",
  introMD: `Containers package an app with its dependencies; Kubernetes runs and heals those containers across a cluster. You already know the definitions — interviews test whether you can **reason about production behaviour**: why a healthy-looking deployment serves 503s, why pods crash-loop, and how autoscaling actually reacts to load.

This module skips the tutorials and goes straight to the objects that matter and the failures you will be asked to debug.`,
  coreFlow: {
    title: "How a request reaches your code",
    body: `User
 -> Ingress   (routing + TLS)
 -> Service   (stable virtual IP, load-balances)
 -> Pod       (one or more replicas)
 -> Container (your process)`,
  },
  seniorFocus: [
    "Explain the Deployment -> ReplicaSet -> Pod -> Container ownership chain.",
    "Use readiness and liveness probes correctly — they solve different problems.",
    "Set resource requests/limits so the scheduler and HPA behave predictably.",
    "Reason about rollouts and rollbacks as the default safe-release mechanism.",
    "Debug 503s, crash loops, and scaling issues from symptoms to root cause.",
  ],
  concepts: [
    {
      id: "image-vs-container",
      title: "Images, layers & multi-stage builds",
      whatMD: `An **image** is an immutable, layered template; a **container** is a running instance of it. Each Dockerfile instruction adds a cached layer, so ordering instructions well makes builds fast and images small.`,
      howMD: `Multi-stage builds compile in a heavy build image, then copy only the artifact into a slim runtime image. This shrinks the attack surface and image size — often from gigabytes to tens of megabytes.`,
      diagram: {
        title: "Multi-stage build",
        body: `Stage 1 (build):  SDK image -> compile -> /app/out
Stage 2 (runtime): slim image <- copy /app/out
Result: small, production-only image`,
      },
      interviewPoints: [
        "Order Dockerfile layers stable-to-volatile so dependency layers stay cached.",
        "Multi-stage builds keep build tools out of the runtime image.",
        "Pin base image versions; 'latest' makes builds non-reproducible.",
        "Smaller images pull faster (quicker scale-up) and have less to exploit.",
      ],
      realWorldMD: `A 1.2 GB image is rebuilt as a multi-stage build with a slim runtime base and drops to 90 MB — pod start time during a scale-up event falls from ~40s to ~8s.`,
    },
    {
      id: "core-objects",
      title: "Deployment, ReplicaSet, Pod, Container",
      whatMD: `A **Deployment** declares the desired state; it manages a **ReplicaSet** that keeps N **Pods** running; each Pod runs one or more **Containers**. You change the Deployment and Kubernetes reconciles reality to match.`,
      diagram: {
        title: "Ownership chain",
        body: `Deployment  (desired state: 5 replicas, image v2)
   -> ReplicaSet  (ensures 5 pods exist)
       -> Pods    (scheduled onto nodes)
           -> Containers (your process)`,
      },
      interviewPoints: [
        "You rarely create Pods directly — Deployments manage them for self-healing.",
        "A ReplicaSet's only job is keeping the requested pod count alive.",
        "Rolling updates create a new ReplicaSet and shift pods gradually.",
        "Pods are ephemeral and get new IPs — never depend on a pod IP directly.",
      ],
    },
    {
      id: "service-ingress",
      title: "Service & Ingress",
      whatMD: `Pods are ephemeral, so a **Service** gives a stable virtual IP and load-balances across matching pods. **Ingress** sits in front, terminating TLS and routing external HTTP paths/hosts to the right Service.`,
      interviewPoints: [
        "A Service selects pods by label and load-balances across ready ones only.",
        "Ingress handles host/path routing and TLS; Service handles in-cluster balancing.",
        "ClusterIP (internal), NodePort, and LoadBalancer are different Service exposures.",
        "If pods are not 'ready', the Service removes them from rotation automatically.",
      ],
      realWorldMD: `An Ingress routes api.example.com to the api Service and app.example.com to the web Service. Scaling the api deployment adds pods the Service picks up automatically — no Ingress change.`,
    },
    {
      id: "probes",
      title: "Readiness vs liveness probes",
      whatMD: `A **readiness** probe decides whether a pod should receive traffic; a **liveness** probe decides whether a pod should be restarted. They look similar but solve opposite problems.`,
      howMD: `If readiness fails, the pod stays running but is pulled out of the Service — used for warm-up and dependency checks. If liveness fails, the kubelet **kills and restarts** the container — used to recover from deadlocks. Misconfiguring liveness (e.g. pointing it at a slow dependency) causes needless restart loops.`,
      diagram: {
        title: "Probe outcomes",
        body: `readiness fail -> remove pod from Service (no restart)
liveness  fail -> restart the container
startup   probe -> guards slow-starting apps first`,
      },
      interviewPoints: [
        "Readiness controls traffic; liveness controls restarts — never conflate them.",
        "A liveness probe that checks downstream deps causes cascading restarts.",
        "Use a startup probe for slow-booting apps so liveness does not kill them early.",
        "Readiness gating is what makes zero-downtime rollouts actually zero-downtime.",
      ],
      interviewQuestions: [
        "A deployment succeeds but users get 503s. How do probes and Service readiness explain it?",
      ],
    },
    {
      id: "resources-hpa",
      title: "Requests, limits & autoscaling",
      whatMD: `A **request** is the resource the scheduler reserves for a pod; a **limit** is the ceiling it may use. The **Horizontal Pod Autoscaler (HPA)** adds or removes pods based on observed metrics (often CPU) relative to requests.`,
      howMD: `HPA compares current utilisation against the target percentage of the request. If requests are set wrong, HPA scales at the wrong time — too-high requests waste capacity and scale late; too-low requests throttle pods and scale in a storm. Exceeding a memory limit gets the container OOM-killed.`,
      interviewPoints: [
        "HPA math is relative to requests — bad requests break autoscaling.",
        "CPU over the limit is throttled; memory over the limit is OOM-killed.",
        "Set requests from real usage percentiles, not guesses.",
        "Scale on the metric that reflects load (RPS/queue depth) when CPU is a poor proxy.",
      ],
      realWorldMD: `CPU spikes and latency climbs but HPA never scales — requests were set at 2 cores while pods actually use 200m, so utilisation never crosses the target. Right-sizing requests fixes autoscaling.`,
      interviewQuestions: [
        "CPU suddenly increases and latency rises, but the HPA does not scale. What is wrong?",
      ],
    },
    {
      id: "rollout-rollback",
      title: "Rolling updates & rollback",
      whatMD: `A rolling update replaces pods gradually — new ReplicaSet up, old one down — governed by maxSurge and maxUnavailable. If the new version is bad, **rollback** returns to the previous ReplicaSet quickly.`,
      interviewPoints: [
        "Rolling updates keep capacity up during a deploy via maxSurge/maxUnavailable.",
        "Readiness probes prevent traffic hitting not-yet-ready new pods.",
        "Rollback is fast because the old ReplicaSet is retained.",
        "A failed rollout usually means new pods never became ready — check probes/config.",
      ],
      realWorldMD: `A rollout stalls at 40%: new pods stay 'not ready' because a missing ConfigMap key crashes startup. Kubernetes holds old pods in service, so users are unaffected while you roll back.`,
    },
  ],
  keyTakeaways: [
    "Requests flow User -> Ingress -> Service -> Pod -> Container; pods are ephemeral, Services are stable.",
    "Deployment -> ReplicaSet -> Pod -> Container is the self-healing ownership chain.",
    "Readiness gates traffic; liveness triggers restarts — mixing them causes crash loops.",
    "HPA scales relative to requests, so wrong requests break autoscaling; memory over limit is OOM-killed.",
    "Rolling updates + retained old ReplicaSets make deploys safe and rollbacks fast.",
  ],
  relatedQuestionIds: [
    "k8s-503-debug",
    "k8s-crashloop",
    "k8s-hpa-not-scaling",
    "docker-image-size",
  ],
};
