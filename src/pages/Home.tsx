import { useState } from 'react';
import { 
    ReactFlow,
    Background, 
    Controls,
    MarkerType,
    useNodesState,
    useEdgesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const PDFUploader = () => {
        console.log(test);
        

        const [file, setFile] = useState(null);
        const [loading, setLoading] = useState(false);
        const [result, setResult] = useState(null);
        const [error, setError] = useState(null);
        const [saving, setSaving] = useState(false);

        const handleFileChange = (event) => {
                const selectedFile = event.target.files[0];
                if (selectedFile && selectedFile.type === 'application/pdf') {
                        setFile(selectedFile);
                        setError(null);
                } else {
                        setError('Please select a PDF file');
                        setFile(null);
                }
        };

        const handleUpload = async () => {
                if (!file) {
                        setError('Please select a file first');
                        return;
                }

                const formData = new FormData();
                formData.append('pdf', file);

                setLoading(true);
                setError(null);
                setResult(null);

                try {
                        const response = await fetch('http://localhost:3000/upload', {
                                method: 'POST',
                                body: formData,
                        });

                        const data = await response.json();

                        if (!response.ok) {
                                throw new Error(data.message || 'Upload failed');
                        }

                        console.log(data);
                        setResult(data);
                } catch (err) {
                        setError(err.message || 'Failed to upload file');
                } finally {
                        setLoading(false);
                }
        };

        const handleSave = async () => {
                if (!result) {
                        setError('No mindmap data to save');
                        return;
                }

                setSaving(true);
                setError(null);

                try {
                        const response = await fetch('http://localhost:3000/save', {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(result),
                        });

                        const data = await response.json();

                        if (!response.ok) {
                                throw new Error(data.message || 'Save failed');
                        }

                        console.log('Mindmap saved successfully');
                } catch (err) {
                        setError(err.message || 'Failed to save mindmap');
                        console.log(err);
                        
                } finally {
                        setSaving(false);
                }
        };

        return (
                <div className="w-full h-screen flex flex-col">
                        <div className="p-4 border-b">
                                <div className="max-w-md mx-auto flex gap-4 items-center">
                                        <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                className="flex-1"
                                        />
                                        <button
                                                onClick={handleUpload}
                                                disabled={!file || loading}
                                                className={`px-4 py-2 rounded ${
                                                        loading 
                                                                ? 'bg-gray-400'
                                                                : 'bg-blue-500 hover:bg-blue-600'
                                                } text-white`}
                                        >
                                                {loading ? 'Processing...' : 'Upload PDF'}
                                        </button>
                                </div>

                                {error && (
                                        <div className="text-red-500 mt-2 text-center">
                                                {error}
                                        </div>
                                )}
                        </div>

                        {test && (
                                <div className="p-4 border-b">
                                        <TestMindMap data={test} />
                                </div>
                        )

                        }

                        {result && (
                                <>
                                        <MindMap data={result} />
                                        <div className="p-4 border-t">
                                                <button
                                                        onClick={handleSave}
                                                        disabled={saving}
                                                        className={`px-4 py-2 rounded ${
                                                                saving 
                                                                        ? 'bg-gray-400'
                                                                        : 'bg-green-500 hover:bg-green-600'
                                                        } text-white`}
                                                >
                                                        {saving ? 'Saving...' : 'Save Mindmap'}
                                                </button>
                                        </div>
                                </>
                        )}
                </div>
        );
};

const TestMindMap = ({data}) => {
        
        // console.log(data.mindmap.mindMap);

        const { mindMap } = data.mindmap;
        console.log(mindMap);

        const CustomNode = ({ data }) => {
                console.log(data);
                
                return (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                                <h3 className="font-medium text-sm mb-2">{data.label}</h3>
                                {data.description && (
                                        <ul className="text-xs text-gray-600 list-disc pl-4">
                                                {data.description.map((point, index) => (
                                                        <li key={index} className="overflow-hidden text-ellipsis">
                                                                {point}
                                                        </li>
                                                ))}
                                        </ul>
                                )}
                        </div>
                );
        };

        const nodeTypes = {
                custom: CustomNode
        };
        

        const createNodesFromMindMap = (mindMap) => {
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                const radius = 300;

                const nodes = mindMap.nodes.map((node, index) => {
                        const angle = (2 * Math.PI * index) / mindMap.nodes.length;
                        const x = centerX + radius * Math.cos(angle);
                        const y = centerY + radius * Math.sin(angle);

                        return {
                                id: node.id,
                                type: 'custom',
                                position: { x, y },
                                data: { label: node.title, description: node.content.keyPoints }
                        };
                });

                const rootNode = {
                        id: 'root',
                        type: 'custom',
                        position: { x: centerX, y: centerY },
                        data: { label: mindMap.title }
                };

                return [rootNode, ...nodes];
        };

        // const initialNodes = createNodesFromMindMap(mindMap);

        // const initialNodes = [
        //         { id: 'node1', position: { x: 0, y: 0 }, data: { label: '1' } },
        //         { id: 'node2', position: { x: 0, y: 100 }, data: { label: '2' } },
        // ];

        // const initialEdges = [{ id: 'eroot-node1', source: 'root', target: 'node1' }];

        const createInitialEdges = (mindMap) => {
                const edges = [];

                mindMap.nodes.forEach(node => {
                                edges.push({
                                        id: `eroot-${node.id}`,
                                        source: 'root',
                                        target: node.id,
                                        markerEnd: { type: MarkerType.Arrow },
                                        type: 'straight',
                                        animated: true,
                                        style: { stroke: '#93c5fd' }
                                });
                });

                return edges;
        };

        // const initialEdges = createInitialEdges(mindMap);

        const [nodes, setNodes, onNodesChange] = useNodesState(createNodesFromMindMap(mindMap));
        const [edges, setEdges, onEdgesChange] = useEdgesState(createInitialEdges(mindMap));
        
        return (
                <div className="w-full h-dvh">
                {data.mindmap.mindMap.title}
                <ReactFlow 
                        nodes={nodes} 
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                />
                </div>
        )
}

const MindMap = ({ data }) => {
        console.log(data);
        const { mindMap } = data.data.mindmap;
        
        const CustomNode = ({ data }) => {
                console.log(data);
                
                return (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                                <h3 className="font-medium text-sm mb-2">{data.label}</h3>
                                {data.description && (
                                        <ul className="text-xs text-gray-600 list-disc pl-4">
                                                {data.description.map((point, index) => (
                                                        <li key={index} className="overflow-hidden text-ellipsis">
                                                                {point}
                                                        </li>
                                                ))}
                                        </ul>
                                )}
                        </div>
                );
        };

        const nodeTypes = {
                custom: CustomNode
        };

        const createInitialNodes = () => {
                const centerX = window.innerWidth / 2;
                const centerY = 100;
                const radius = 300;

                const mainNode = {
                        id: 'main',
                        type: 'custom',
                        position: { x: centerX, y: 50 },
                        data: { 
                                label: mindMap.title,
                                description: [],
                        }
                };

                const childNodes = mindMap.nodes.map((node, index) => {
                        console.log(node.keyPoints);

                        const angle = (2 * Math.PI * index) / mindMap.nodes.length;
                        const x = centerX + radius * Math.cos(angle);
                        const y = centerY + radius * Math.sin(angle);

                        return {
                                id: node.id,
                                type: 'custom',
                                position: { x, y },
                                data: { 
                                        label: node.title,
                                        description: node.keyPoints,
                                }
                        };
                });

                return [mainNode, ...childNodes];
        };

        const createInitialEdges = () => {
                console.log(...mindMap.nodes);
                
                return mindMap.nodes.map((node, index) => ({
                        id: `emain-${index}`,
                        source: 'main',
                        target: node.id,
                        markerEnd: { type: MarkerType.Arrow },
                        type: 'smoothstep',
                        animated: true,
                        style: { stroke: '#93c5fd' }
                }));
        };

        const [nodes, setNodes, onNodesChange] = useNodesState(createInitialNodes());
        const [edges, setEdges, onEdgesChange] = useEdgesState(createInitialEdges());

        return (
                <div className="flex-1">
                        <ReactFlow 
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                nodeTypes={nodeTypes}
                                fitView
                                className="bg-blue-50"
                        >
                                <Background color="#93c5fd" gap={16} />
                                <Controls />
                        </ReactFlow>
                </div>
        );
};

export default PDFUploader;

const test = {
        "success": true,
        "mindmap": {
            "mindMap": {
                "nodes": [
                    {
                        "content": {
                            "keyPoints": [
                                "Mind map as an effective tool for teaching-learning",
                                "Shifting from teacher-centric to learner-centric classroom",
                                "Promotes out-of-the-box thinking",
                                "Structure and visualize information"
                            ],
                            "keyPointsExplanation": [
                                "Mind map is used as an effective tool for teaching-learning in the classroom.",
                                "With the growing demand of shifting from teacher-centric to learner –centric classroom, mind map is looked at as an active learning module to tap lateral thinking of students.",
                                "It helps them to record notes in a non -linear way and promotes out-of-the-box thinking.",
                                "Hence, mind maps are a popular tool to structure and visualize information."
                            ]
                        },
                        "id": "node1",
                        "title": "Abstract",
                        "unchangedText": "ABSTRACTDr.G.Chandramohan\nVice -Principal\nPSG Institute of Technology and Applied Research , line \nNeelambur, Coimbatore, Tamilnadu, India\ne-mail: gcm@psgitech.ac.in\nMind map is used as an effective tool for teaching-learning \nin the classroom. With the growing demand of shifting from \nteacher-centric to learner –centric classroom, mind map is \nlooked at as an active learning module to tap lateral thinking \nof students. It helps them to record notes in a non -linear way \nand promotes out-of-the-box thinking. Hence, mind maps are \na popular tool to structure and visualize information. It is an \nactivist learning method for capturing ideas on a horizontal \nsurface. It is a graphical way to represent large information \ninto a useful knowledge base and also helps in connecting \nthe knowledge base with real time scenario. This facilitates \nthe students to build better and new ideas. This paper aims at \nbringing out the learning experie nces of students using mind \nmap in recalling technical concepts in the course Materials \nand Metallurgy. A questionnaire was administered to find \nout the various learning experiences of third year Mechanical \nstudents of this course. Findings showed that there was a \nsignificant positive difference in student’s academic \nachievement and attitude towards learning the subject \nthrough mind mapping.",
                        "children": [
                            "node2",
                            "node3"
                        ]
                    },
                    {
                        "content": {
                            "keyPoints": [
                                "Education is for individual success in society",
                                "Mind mapping as a visual note taking method"
                            ],
                            "keyPointsExplanation": [
                                "Education is the process of developing the capacities and potentials of an individual so as to prepare that individual to be successful in a specific society or culture.",
                                "Mind mapping is a diagram used to visual form of note taking that offers an overview of a topic and its complex information, allowing students to comprehend, create new ideas and build connections."
                            ]
                        },
                        "id": "node2",
                        "title": "Introduction",
                        "unchangedText": "I. I NTRODUCTION\nEducation is the process of developing the capacities and \npotentials of an individual so as to prepare that individual to \nbe successful in a specific society or culture. The world is \nbecoming more and more competitive such that the quality \nof performance has become the key factor for personal \nprogress. Parents desire that their children climb the ladder \nof performance to as high a level as possible. This desire for \na high level of achievement puts a lot of pressure on \nstudents, teachers, and schools and in general education \nsystem itself. School achievement may be affected by \nvarious factors like intelligence, study habits, and attitudes \nof people towards school, different aspects of their \npersonality, socio-economic status etc. The desire of success \nis divided from individual’s concep t of himself and in terms \nof the meaning of various incentives as they spell success \nand failure in the eyes of others thus a child who sees \nhimself as top ranking as scholars may set as his goal the \nattainment of the highest grade in the class.\nMind mapping is a diagram used to visual form of note \ntaking that offers an overview of a topic and its complex information, allowing students to comprehend, create new \nideas and build connections. Through the use of colors, \nimages and words, mind mapping encourages students to \nbegin with a central idea and expand outward to more in-\ndepth sub-topics. Mind maps can be drawn by hand, either \nas \"rough notes\" during a lecture or meeting, for example, \nor as higher quality pictures when more time is available. \nAn example of a rough mind map is illustrated. \n                           Fig.1 Mind map on ",
                        "children": [
                            "node4"
                        ]
                    },
                    {
                        "content": {
                            "keyPoints": [
                                "Online mapping tool to refine a literature review",
                                "Concept maps to analyse core concepts and emergent themes"
                            ],
                            "keyPointsExplanation": [
                                "Vanderheide, Moss, and Lee (2013) employed an online mapping tool to refine a literature review as a way to integrate new knowledge and identify themes.",
                                "Meagher-Stewart et al. (2012) used concept maps to analyse core concepts and emergent themes."
                            ]
                        },
                        "id": "node3",
                        "title": "Review of Literature",
                        "unchangedText": "II. R EVIEW OF LITERATURE\nVanderheide, Moss, and Lee (2013) employed an online \nmapping tool to refine a literature review as a way to \nintegrate new knowledge and identify themes. The outcome \nof the process revealed that some themes had extensive \nliterature bases while others were just emerging. Likewise, \nin Pfau et al.’s (2009) study, participants were instructed to \nconstruct their own concept map on an issue in question. \nUpon completion of the concept map, participants assessed \nhow strongly they felt about each of the themes in their \nconcept map by rating it from 1 (very weak) to 7 (very \nstrong). Meagher-Stewart et al. (2012) used concept maps to \nanalyse core concepts and emergent themes. Concept maps \nmay be defined as a type of diagram (Umoquit, Tso, Varga-\nAtkins, O’Brien, & Wheeldon, 2013) or mind map \n(Wheeldon, 2011); however, concept maps are further \ndelineated depending on authors’ theoretical and \nmethodological orientations.",
                        "children": [
                            "node5"
                        ]
                    },
                    {
                        "content": {
                            "keyPoints": [
                                "Case study on using mind maps in engineering education",
                                "Conceptual mapping for course understanding",
                                "Shift to learning-centric from teaching-centric"
                            ],
                            "keyPointsExplanation": [
                                "This paper focuses on illustration of the case study of using mind map as a technique to educate ‘Materials and Metallurgy’ to third year engineering undergraduates in an Engineering Institution.",
                                "Conceptual mapping as implemented in this study has two major purposes. One is to help students gain and maintain an understanding of the overall conceptual structure of the course",
                                "The approach has to be shifted to learning centric from teaching centric."
                            ]
                        },
                        "id": "node4",
                        "title": "Methodology",
                        "unchangedText": "III. M ETHODOLOGY\nThis paper focuses on illustration of the case study of using \nmind map as a technique to educate ‘Materials and \nMetallurgy’ to third year engineering undergraduates in an \nEngineering Institution. Transmission of knowledge present \nin the information by teachers does not guarantee an \neffective understanding of the student in a large class room \nwhich has been a greatest challenge [9]. Conventional \nteaching methods involve problem solving on boards as \nnormal chalk and talk method it works only for a small \ngroup of students. In order to address the large class room \nvisual techniques must be used as 65% of students are visual \nlearners.\nConceptual mapping as implemented in this study has two \nmajor purposes. One is to help students gain and maintain \nan understanding of the overall conceptual structure of the \ncourse and, even more broadly, to see how and where the \nideas in this course relate to other aspects of the engineering \ncurriculum. The point is to help students avoid the sort of \ntunnel vision that can occur as students work on specific \ncourse tasks but never develop a meaningful conception of \nwhat the course is about. A second, more focused map is \nused to help students organize their thinking and \nunderstanding of specific technical concepts. This study \nreports on how the maps were developed, used, and \nreceived by both students and the instructor in an \nengineering course. The techniques used to develop the \nmaps highlight collaboration between the engineering \ninstructor and a cognitive scientist. We also solicited \nstudent feedback during the course and made adjustments in \nthe map if these seemed warranted. The instructor referred \nfrequently to the map, modeled its use in his own problem \nsolving and thinking about the course ideas. \nFig.2 Mind map on Alloys\nThe approach has to be shifted to learning centric from \nteaching centric. The details of this activity are presented in \nthis section. The activity involves the following :Concept analysis: In this, students have to analyse the \nconcepts dealt in the class and build a mind map based on \ntheir understanding of the topics covered in the class \nindividually in every hour of the class on daily bases.\nGroup formation: In this the students in a group of four \nhave discussions on the individual mind maps, gather all the \ninformation from different mind maps exchange views and \nthe group has to come up with a master mind map \ncomprising of the view points of every individual in a team.",
                        "children": [
                            "node6"
                        ]
                    },
                    {
                        "content": {
                            "keyPoints": [
                                "Student responses to using mind maps",
                                "Mind map is an effective tool to recall technical concepts",
                                "Mind map helps to remember and recollect information better than note making"
                            ],
                            "keyPointsExplanation": [
                                "A questionnaire survey was conducted to administer the effect of introducing mind map as a part of teaching-learning.",
                                "Question 1 reflects on the improvement on the memory in recalling, and in response 87% students agreed that relates to whether the students will use this learning technique in future for interactive learning.",
                                "Mind mapping helps me to remember and recollect information better than note- making."
                            ]
                        },
                        "id": "node5",
                        "title": "Survey Results",
                        "unchangedText": "A questionnaire survey was conducted to administer the \neffect of introducing mind map as a part of teaching-\nlearning. The entire class of 69 students was considered for \nthis study. The questionnaire was conducted using 5 Likert \nscale. Question 1 reflects on the improvement on the \nmemory in recalling, and in response 87% students agreed \nthat relates to whether the students will use this learning \ntechnique in future for interactive learning. \nThe questions are as follows:\n1.Mind mapping is an effective tool to recall the \ntechnical concepts.\n2.Mind mapping helps me to remember and recollect \ninformation better than note- making.\n3.The images, symbols and keywords, found in \nmind maps, helped me dynamically relate with \nconcepts.\n4.There is clear connectivity and categorization of \ntopics when I mind map.\n5.Mind map helped me to collaborate with peers in \nthe process of active learning.\n6.Mind map enabled me to think on a specific \nconcept in a wide perspective.\n7.There was an increase in the confidence l evel, \nwhen I presented ideas on paper, learnt from \nmind mapping.\n8.Mind map stimulates visual thinking.\n9.In future ‘mind mapping’ can be integrated in all \nclasses as a part of teaching and learning.\n10.Mind map helped me to revise the course at the \ntime of examination/test\n         Fig.3 Survey on using mindmap in the classroom",
                        "children": [
                            "node7"
                        ]
                    },
                    {
                        "content": {
                            "keyPoints": [
                                "Mind mapping reduces difficulty in writing",
                                "Mind mapping aids recall of memories"
                            ],
                            "keyPointsExplanation": [
                                "Mind mapping reduces the difficulty by giving students an organizing strategy to get them started.",
                                "Mind mapping also aids recall of existing memories."
                            ]
                        },
                        "id": "node6",
                        "title": "Analysis and Interpretation",
                        "unchangedText": "IV. A NALYSIS AND INTERPRETATION\nIt was observed that the students were very responsive to the \nuse of mind map in the class. Many students find writing \ndifficult, and they find getting started the most difficult part \nof writing. Mind mapping reduces the difficulty by giving \nstudents an organizing strategy to get them started. In mind \nmapping, ideas are freely associated and written out without \npressure, thereby reducing tension and resistance often \nassociated with writing. Although, it is one type of outlining \nmethods, the product of the prewriting activity using mind \nmapping is notably different from the one using other type \nof outlining. Unlike conventional outlining, the product of \nprewriting activity using mind mapping does not follow a \nrigid fixed linear. In outlining, ideas must be arranged \nsequentially which is contradictory with the natural way of \nhow brain works, because brain works in a non linear way. \nThe elements of a given mind map are arranged intuitively \naccording to the importance of the concepts, and are \nclassified into groupings, branches, or areas, with the goal \nof representing semantic or other connections between \nportions of information. Mind mapping also aids recall of \nexisting memories. Mind mapping may be used effectively \nwith students beyond primary grades and in any class that \nrequires writing. It is obviously appropriate for language \nclasses. It is applicable for large groups. Teaching students \nhow to use mind mapping takes about 10 minutes of \ndemonstration time.",
                        "children": [
                            "node8"
                        ]
                    },
                    {
                        "content": {
                            "keyPoints": [
                                "Interactive learning technique through mind mapping",
                                "Students found it easier to visualize the concepts",
                                "Positive outcome on interactive learning ability"
                            ],
                            "keyPointsExplanation": [
                                "This paper presents an effective learning technique in large classroom for the course Materials and Metallurgy and in this study it is observed that the students who used interactive learning technique that is, mind mapping found it easier to learn and visualize the concepts.",
                                "As this is a collaborative learning technique the students were motivated to learn the course.",
                                "The most prominent positive outcome of the experiment is that over 90% of the students have clearly indicated that this has given them a very good opportunity to evaluate, work on and improve their ability for interactive learning."
                            ]
                        },
                        "id": "node7",
                        "title": "Conclusion",
                        "unchangedText": "V. CONCLUSION\nThis paper presents an effective learning technique in large\nclassroom for the course Materials and Metallurgy and in \nthis study it is observed that the students who used \ninteractive learning technique that is, mind mapping found it \neasier to learn and visualize the concepts. As this is a \ncollaborative learning technique the students were \nmotivated to learn the course. Students who were not good \nin mathematics found it easy after using this technique as \nthey could analyze the connectivity between different \nconcepts. The most prominent positive outcome of the \nexperiment is that over 90% of the students have clearly \nindicated that this has given them a very good opportunity \nto evaluate, work on and improve their ability for interactive \nlearning. This interactive learning approach adopted has \ngreat impact in significantly improving the overall teaching \nlearning process, encouraging the faculty and the students to \nextend the same to the relevant courses in the curricula \nprogram.",
                        "children": []
                    },
                    {
                        "content": {
                            "keyPoints": [],
                            "keyPointsExplanation": []
                        },
                        "id": "node8",
                        "title": "References",
                        "unchangedText": "VI. R EFERENCES\n[1] Mind Mapping Scientific research and studies Think Buzan ltd[2] Use of mind mapping technique in EFL class room by Teddy \nFiktorious [3] www.adelaide.edu.au/writing centre /.../ \nlearningGuide_mindMapping.pdf\n[4] Interactive Multimedia Cognitive Mind Mapping Approach in \nLearning Geography Manjit Singh Sidh*1, Noor Haitham Saleem*2 \nMultimedia Technology (MT) Volume 2 Issue 2, June 2013\n[5] Concept mapping, mind mapping and argument mapp ing: what are \nthe differences and do they matter? Martin Davies Springer \nScience+Business Media B.V. 2010\n[6] M ichael  Prince,   ‘Does   Active  Learning   Work?A  Review  of   \nthe Research’,Journal of Engineering Education,July 2004, pp. 1-9\n[7] http://www.abet.org/specialreports/\n[8] Jennifer M. Case , Gregory Light,‘Emerging Methodologies in \nEngineering Education Research’Journal of Engineering Education  \nJanuary 2011, Vol. 100, No. 1,pp.186-210\n[9] Edward F. Redish, Kar l A. Smithg ,‘Looking Beyond Content: Skill \nDevelopment For Engineers unpublished\n[10] Nancy Van Note Chism,Elliot Douglas,Wayne J. Hilson, Jr, \n‘Qualitative Research Basics: A Guide for Engineering Educators ’,\n[11] Bhavya Lal, ‘Strategies foe Evaluating  Engineering Education \nResearch’, Workshop Report unpublished\n[12] Laury Bollen, Boudewijn Janssen, Wim Gijselaers, ‘Measuring the  \neffect of innovations in teaching methods on the performance of \naccounting students’",
                        "children": [],
                        "references": [
                            {
                                "title": "Mind Mapping Scientific research and studies",
                                "url": "Think Buzan ltd"
                            },
                            {
                                "title": "Use of mind mapping technique in EFL class room",
                                "url": "Teddy Fiktorious"
                            },
                            {
                                "title": "Learning Guide on mind Mapping",
                                "url": "www.adelaide.edu.au/writing centre /.../ learningGuide_mindMapping.pdf"
                            },
                            {
                                "title": "Interactive Multimedia Cognitive Mind Mapping Approach in Learning Geography",
                                "url": "Multimedia Technology (MT) Volume 2 Issue 2, June 2013"
                            },
                            {
                                "title": "Concept mapping, mind mapping and argument mapping: what are the differences and do they matter?",
                                "url": "Martin Davies Springer Science+Business Media B.V. 2010"
                            },
                            {
                                "title": "Does Active Learning Work?A Review of the Research",
                                "url": "Journal of Engineering Education,July 2004, pp. 1-9"
                            },
                            {
                                "title": "",
                                "url": "http://www.abet.org/specialreports/"
                            },
                            {
                                "title": "Emerging Methodologies in Engineering Education Research",
                                "url": "Journal of Engineering Education January 2011, Vol. 100, No. 1,pp.186-210"
                            },
                            {
                                "title": "Looking Beyond Content: Skill Development For Engineers",
                                "url": "unpublished"
                            },
                            {
                                "title": "Qualitative Research Basics: A Guide for Engineering Educators",
                                "url": ""
                            },
                            {
                                "title": "Strategies foe Evaluating  Engineering Education Research",
                                "url": "Workshop Report unpublished"
                            },
                            {
                                "title": "Measuring the effect of innovations in teaching methods on the performance of accounting students",
                                "url": ""
                            }
                        ]
                    }
                ],
                "title": "Case Study on Effective use of Mind map in Engineering Education"
            }
        }
    };
