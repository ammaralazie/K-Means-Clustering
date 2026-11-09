
const myData = {
    'Student': ['أحمد', 'سارة', 'علي', 'مريم', 'عمر', 'خالد', 'فاطمة', 'يوسف', 'زينب', 'حسن'],
    'Grade_Level': [1, 1, 1, 2, 2, 2, 3, 3, 3, 3], // 1: ابتدائي, 2: متوسط, 3: ثانوي
    'Age': [8, 9, 8, 13, 14, 13, 17, 18, 17, 16],
    'Academic_Score': [9, 8, 3, 9, 4, 8, 9, 3, 8, 2] // قياس من 10
}


/*
    راح انقسم هذه البيانات الى 
    طلاب متفوقين صغار و متفوقين كبار و طلاب يحتاجون الى دعم فني
    اذن راح انقسم البيانات الى ثلاث مجاميع 
    k=3
  
  */

const k = 3  // number of clusters
let centeriods: number[][] = [] // intial center for cluster 1
let numberOfUpdateONcentroides = 0

const sum = (arr: number[]) => {

    let total = 0

    if (Array.isArray(arr)) {
        arr.forEach((num) => {
            total += num
        })
    }

    return total
}// /sum

const mean = (arr: number[]) => {

    let total = sum(arr)
    const count = Array.isArray(arr) ? arr.length : 0
    return count > 0 ? total / count : 0

}// /mean

const square = (num: number) => {
    return num ** 2
}// /square


const squareRoot = (num: number) => {
    return Math.sqrt(num)
}// /squareRoot


/* 
حاليا نحتاج الى توحيد الاوزان لكل القيم الي عدنا
 حتى لا تطغى القيم الكبيرة على القيم الصغيرة 

 راح نستخدم StandardScaler لا
 لانه يستطيع التعامل مع القيم الشاذة 
 وقانونه هي القيمة ناقص المعدل على الانحارف المعياري 


 يتم احتساب الانحراف المعياري 
 واحد - نحسب المعدل
 ثنين - نحسب الفرق بين كل قيمة و المعدل
 ثلاثه - نحسب مربع الفرق
 اربعه - نحسب المعدل لمربعات الفرق
 خمسه - نحسب الجذر التربيعي للمعدل لمربعات الفرق
*/



/* يكون ثابت عند كل عنصر  */
const standardDeviation = (arr: number[]) => {

    const avarge = mean(arr)

    const newArr = arr.map((num) => {
        return square(num - avarge)
    })// /newArr

    const meanOfNewArr = mean(newArr)

    return squareRoot(meanOfNewArr)
}// /standardDeviation



/* الان سوف نستخدم k means ++

الي راح تساعدنا على اختيار المراكز الاولية بشكل افضل من اختيارها عشوائيا
*/


/* القانوان الخاص بها هو المسافة بينها وبين المركز تربيع على مجموع تربيع المسافات  */

/*  بهذه الطريقة نطلع النقطة الثانيه ونعيد الكره على عدد k 
الي عندي 

يتم حتساب المسافة من خلال Eclidean Distance
*/

const eleuclideanDistance = (point1: number[], point2: number[]) => {

    if (point1.length !== point2.length) {
        throw new Error('Points must have the same dimensions')
    }// /if

    let sumOfSquares = 0

    for (let i = 0; i < point1.length; i++) {
        sumOfSquares += square(point1[i] - point2[i])
    }// /for

    return squareRoot(sumOfSquares)
}// /eleuclideanDistance

/* هسة راح انطبق القانون الخاص StandardScaler */
myData.Age = myData.Age.map((num) => {
    const avarge = mean(myData.Age)
    const stdDev = standardDeviation(myData.Age)
    return (num - avarge) / (stdDev || 1)
})

myData.Academic_Score = myData.Academic_Score.map((num) => {
    const avarge = mean(myData.Academic_Score)
    const stdDev = standardDeviation(myData.Academic_Score)
    return (num - avarge) / (stdDev || 1)
})

myData.Grade_Level = myData.Grade_Level.map((num) => {
    const avarge = mean(myData.Grade_Level)
    const stdDev = standardDeviation(myData.Grade_Level)
    return (num - avarge) / (stdDev || 1)
})

centeriods = [
    [myData.Age[0], myData.Academic_Score[0], myData.Grade_Level[0]], // initial center for cluster 1
]// /centeriods

const kMeansPlusPlus = async (data: any, k: number) => {
    if (centeriods.length === 0) {
        const randomIndex = Math.floor(Math.random() * data.Student.length)

        centeriods.push([
            data.Age[randomIndex],
            data.Academic_Score[randomIndex],
            data.Grade_Level[randomIndex]
        ])
    }

    while (centeriods.length < k) {

        const distances: number[] = []

        for (let j = 0; j < data.Student.length; j++) {

            const point = [
                data.Age[j],
                data.Academic_Score[j],
                data.Grade_Level[j]
            ]

            let minDistance = Infinity

            for (let i = 0; i < centeriods.length; i++) {

                const distance =
                    eleuclideanDistance(point, centeriods[i])

                if (distance < minDistance) {
                    minDistance = distance
                }
            }

            distances.push(minDistance)
        }

        const squaredDistances = distances.map(distance =>
            Math.pow(distance, 2)
        )

        const total = squaredDistances.reduce(
            (sum, distance) => sum + distance,
            0
        )

        const probabilities = squaredDistances.map(distance =>
            distance / total
        )

        const random = Math.random()

        let cumulativeProbability = 0
        let selectedIndex = 0

        for (let i = 0; i < probabilities.length; i++) {

            cumulativeProbability += probabilities[i]

            if (random <= cumulativeProbability) {
                selectedIndex = i
                break
            }
        }
        centeriods.push([
            data.Age[selectedIndex],
            data.Academic_Score[selectedIndex],
            data.Grade_Level[selectedIndex]
        ])
    }

    return centeriods
}// /k-means ++ 


const calculateNewCentroids = (clusters: any, oldCnteroids: any) => {
    const newCentroids = []

    for (let i = 0; i < clusters.length; i++) {

        const cluster = clusters[i]

        if (cluster.length === 0) {
            newCentroids.push(oldCnteroids[i])
            continue
        }// /if

        const dimensions = cluster[0].length
        const sums = new Array(dimensions).fill(0)


        cluster.forEach((point: any) => {
            for (let d = 0; d < dimensions; d++) {
                sums[d] += point[d]
            }
        })

        console.log("sums : ", sums)
        const newCentroid = sums.map(item => item / cluster.length)
        newCentroids.push(newCentroid)

    }// /for loop

    return newCentroids
}// /calculateNewCentroids

const centroidsMoved = (oldC: number[][], newC: number[][], tolerance = 1e-4) => {
    return oldC.some((c, i) => eleuclideanDistance(c, newC[i]) > tolerance)
}

const runKmeansAlogrithem = async (data: any, k: number, iterations: number) => {

    await kMeansPlusPlus(data, k)

    let finalClusters: number[][][] = []

    for (let iter = 0; iter < iterations; iter++) {

        const newClasters: number[][][] = Array.from({ length: k }, () => [])

        for (let index = 0; index < data.Student.length; index++) {
            const point = [data.Age[index], data.Academic_Score[index], data.Grade_Level[index]]
            const distances = centeriods.map((c: number[]) => eleuclideanDistance(point, c))
            const minIdx = distances.indexOf(Math.min(...distances))
            newClasters[minIdx].push(point)
        }

        finalClusters = newClasters

        const oldCentroids = centeriods
        centeriods = calculateNewCentroids(newClasters, centeriods)

        if (!centroidsMoved(oldCentroids, centeriods)) {
            console.log("converged at iteration", iter + 1)
            break
        }//if

    }// /for loop

    finalClusters.forEach((cluster, i) => {
        const sums = [0, 1, 2].map(d => sum(cluster.map(p => p[d])))
        console.log(`cluster ${i + 1} | points: ${cluster.length} | sums:`, sums)
    })

    console.log("final centroids:", centeriods)
}//runKmeansAlogrithem



runKmeansAlogrithem(myData, 3, 100)

export { }
