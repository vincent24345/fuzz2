import React, { useState, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, ReferenceLine, Scatter, Brush, ZoomOutMap
} from 'recharts';

export default function BugSurvivalChart() {
  const [selectedBugs, setSelectedBugs] = useState({
    'FW11': true,
    'FW18': true,
    'CNCFP01': true
  });
  
  const [zoomDomain, setZoomDomain] = useState(null);
  const [selectedCrash, setSelectedCrash] = useState(null);
  const chartRef = useRef(null);

  const handleBugToggle = (bugId) => {
    setSelectedBugs(prev => ({
      ...prev,
      [bugId]: !prev[bugId]
    }));
  };
  
  const handleZoomOut = () => {
    setZoomDomain(null);
  };

  // Process raw data
  const processRawData = () => {
    // Extract timestamps from crash data
    const extractTimeData = (run, bugId) => {
      const runData = campaignData[`run-${run}`];
      if (!runData) return [];
      
      const bugData = runData.find(item => item.bug_id === bugId);
      if (!bugData || !bugData.raw_crash_data || bugData.raw_crash_data.length === 0) return [];
      
      return bugData.raw_crash_data.map(crash => {
        const timeMatch = crash.match(/time:(\d+)/);
        return timeMatch ? parseInt(timeMatch[1]) / 1000 : null;
      }).filter(time => time !== null);
    };

    // Convert seconds to hours
    const secondsToHours = (seconds) => seconds / 3600;

    // Initialize data structure for each bug
    const bugs = ['FW11', 'FW18', 'CNCFP01'];
    const bugsData = {};
    
    bugs.forEach(bugId => {
      bugsData[bugId] = {
        triggeredTimes: [],
        reachedTimes: []
      };
      
      // Collect data from all runs
      for (let run = 1; run <= 10; run++) {
        const crashTimes = extractTimeData(run, bugId);
        
        // Get the earliest crash time if available
        if (crashTimes.length > 0) {
          const earliestCrash = Math.min(...crashTimes);
          bugsData[bugId].triggeredTimes.push({
            time: secondsToHours(earliestCrash),
            run: run
          });
        }
        
        // Get reached time if available
        const runData = campaignData[`run-${run}`];
        if (runData) {
          const bugData = runData.find(item => item.bug_id === bugId);
          if (bugData && bugData.reached) {
            bugsData[bugId].reachedTimes.push({
              time: secondsToHours(bugData.reached),
              run: run
            });
          }
        }
      }
    });

    return bugsData;
  };

  // Create survival data points
  const createSurvivalData = (bugsData) => {
    const maxHours = 24;
    const hourlyData = [];
    const totalRuns = 10; // Total number of runs
    
    // Initialize hourly data points
    for (let hour = 0; hour <= maxHours; hour++) {
      hourlyData.push({
        hour,
        FW11_survival: 1.0,
        FW18_survival: 1.0,
        CNCFP01_survival: 1.0
      });
    }
    
    // Process each bug's triggered times
    Object.entries(bugsData).forEach(([bugId, data]) => {
      data.triggeredTimes.sort((a, b) => a.time - b.time).forEach((trigger, index) => {
        // Find the hour bin this trigger falls into
        const hourIndex = Math.ceil(trigger.time);
        const survivalProbability = 1 - ((index + 1) / totalRuns);
        
        // Update all subsequent hours to reflect this bug being triggered
        for (let i = hourIndex; i <= maxHours; i++) {
          hourlyData[i][`${bugId}_survival`] = survivalProbability;
        }
      });
    });
    
    return hourlyData;
  };

  // Extract crash points for scatter plot
  const extractCrashPoints = (bugsData) => {
    const crashPoints = {
      FW11: [],
      FW18: [],
      CNCFP01: []
    };
    
    Object.entries(bugsData).forEach(([bugId, data]) => {
      const totalRuns = 10;
      data.triggeredTimes.sort((a, b) => a.time - b.time).forEach((trigger, index) => {
        crashPoints[bugId].push({
          hour: trigger.time,
          value: 1 - (index / totalRuns), // Survival probability at this point
          run: trigger.run,
          bugId: bugId
        });
      });
    });
    
    return crashPoints;
  };

  // Campaign data
  const campaignData = {
    "run-1": [
      {
        "bug_id": "FW11",
        "reached": null,
        "triggered": null,
        "raw_crash_data": []
      },
      {
        "bug_id": "FW18",
        "reached": 1525,
        "triggered": 2550,
        "raw_crash_data": [
          "./output-01/default/crashes/id:000000,sig:06,src:000671,time:2549543,op:havoc,rep:2",
          "./output-01/default/crashes/id:000001,sig:06,src:000671,time:2553768,op:havoc,rep:8"
        ]
      },
      {
        "bug_id": "CNCFP01",
        "reached": 1561,
        "triggered": 3257,
        "raw_crash_data": [
          "./output-01/default/crashes/id:000006,sig:06,src:000678,time:3256589,op:havoc,rep:8"
        ]
      }
    ],
    "run-2": [
      {
        "bug_id": "FW11",
        "reached": null,
        "triggered": null,
        "raw_crash_data": []
      },
      {
        "bug_id": "FW18",
        "reached": 3655,
        "triggered": 20128,
        "raw_crash_data": [
          "./output-02/default/crashes/id:000000,sig:06,src:001255+001062,time:20128445,op:splice,rep:16"
        ]
      },
      {
        "bug_id": "CNCFP01",
        "reached": 4101,
        "triggered": null,
        "raw_crash_data": []
      }
    ],
    "run-3": [
      {
        "bug_id": "FW11",
        "reached": null,
        "triggered": null,
        "raw_crash_data": []
      },
      {
        "bug_id": "FW18",
        "reached": 2328,
        "triggered": 74832,
        "raw_crash_data": [
          "./output-03/default/crashes/id:000000,sig:06,src:001170,time:74831801,op:havoc,rep:4"
        ]
      },
      {
        "bug_id": "CNCFP01",
        "reached": 2328,
        "triggered": null,
        "raw_crash_data": []
      }
    ],
    "run-4": [
      {
        "bug_id": "FW11",
        "reached": null,
        "triggered": null,
        "raw_crash_data": []
      },
      {
        "bug_id": "FW18",
        "reached": 2185,
        "triggered": 58092,
        "raw_crash_data": [
          "./output-04/default/crashes/id:000000,sig:06,src:001090,time:58092488,op:havoc,rep:4"
        ]
      },
      {
        "bug_id": "CNCFP01",
        "reached": 2409,
        "triggered": null,
        "raw_crash_data": []
      }
    ],
    "run-5": [
      {
        "bug_id": "FW11",
        "reached": 55635,
        "triggered": 56813,
        "raw_crash_data": [
          "./output-05/default/crashes/id:000038,sig:06,src:002106,time:56813264,op:havoc,rep:4"
        ]
      },
      {
        "bug_id": "FW18",
        "reached": 1982,
        "triggered": 23663,
        "raw_crash_data": [
          "./output-05/default/crashes/id:000000,sig:06,src:001234+001476,time:23662618,op:splice,rep:8"
        ]
      },
      {
        "bug_id": "CNCFP01",
        "reached": 2035,
        "triggered": null,
        "raw_crash_data": []
      }
    ],
    "run-6": [
      {
        "bug_id": "FW11",
        "reached": 8168,
        "triggered": null,
        "raw_crash_data": []
      },
      {
        "bug_id": "FW18",
        "reached": 2888,
        "triggered": 28958,
        "raw_crash_data": [
          "./output-06/default/crashes/id:000000,sig:06,src:001819,time:28958233,op:havoc,rep:16"
        ]
      },
      {
        "bug_id": "CNCFP01",
        "reached": 15993,
        "triggered": null,
        "raw_crash_data": []
      }
    ],
    "run-7": [
      {
        "bug_id": "FW11",
        "reached": 56585,
        "triggered": 56703,
        "raw_crash_data": [
          "./output-07/default/crashes/id:000000,sig:06,src:001395+000969,time:56703376,op:splice,rep:2"
        ]
      },
      {
        "bug_id": "FW18",
        "reached": 1980,
        "triggered": null,
        "raw_crash_data": []
      },
      {
        "bug_id": "CNCFP01",
        "reached": 1980,
        "triggered": null,
        "raw_crash_data": []
      }
    ],
    "run-8": [
      {
        "bug_id": "FW11",
        "reached": null,
        "triggered": null,
        "raw_crash_data": []
      },
      {
        "bug_id": "FW18",
        "reached": 16810,
        "triggered": 73913,
        "raw_crash_data": [
          "./output-08/default/crashes/id:000000,sig:06,src:000857+001010,time:73912628,op:splice,rep:16"
        ]
      },
      {
        "bug_id": "CNCFP01",
        "reached": 36366,
        "triggered": null,
        "raw_crash_data": []
      }
    ],
    "run-9": [
      {
        "bug_id": "FW11",
        "reached": null,
        "triggered": null,
        "raw_crash_data": []
      },
      {
        "bug_id": "FW18",
        "reached": 1350,
        "triggered": 47991,
        "raw_crash_data": [
          "./output-09/default/crashes/id:000000,sig:06,src:001338,time:47990503,op:havoc,rep:16"
        ]
      },
      {
        "bug_id": "CNCFP01",
        "reached": 1529,
        "triggered": 60313,
        "raw_crash_data": [
          "./output-09/default/crashes/id:000012,sig:06,src:001341,time:60312875,op:havoc,rep:4"
        ]
      }
    ],
    "run-10": [
      {
        "bug_id": "FW11",
        "reached": null,
        "triggered": null,
        "raw_crash_data": []
      },
      {
        "bug_id": "FW18",
        "reached": 1563,
        "triggered": null,
        "raw_crash_data": []
      },
      {
        "bug_id": "CNCFP01",
        "reached": 1577,
        "triggered": null,
        "raw_crash_data": []
      }
    ]
  };

  const bugsData = processRawData();
  const survivalData = createSurvivalData(bugsData);
  const crashPoints = extractCrashPoints(bugsData);
  
  const handleCrashClick = (data, index) => {
    if (data && data.bugId) {
      const crashInfo = {
        bugId: data.bugId,
        hour: data.hour.toFixed(2),
        run: data.run,
        probability: data.value.toFixed(2)
      };
      setSelectedCrash(crashInfo);
      
      // Set zoom domain around this point (+/- 2 hours)
      setZoomDomain({
        x: [Math.max(0, data.hour - 2), data.hour + 2]
      });
    }
  };

  // Custom tooltip formatter for more detailed information
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 rounded shadow-md">
          <p className="text-gray-700 font-medium">Hour: {label}</p>
          {payload.map((entry, index) => {
            const bugId = entry.dataKey.split('_')[0];
            return (
              <p key={index} style={{ color: entry.color }}>
                {bugId}: {(entry.value * 100).toFixed(0)}% survival rate
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const colorMap = {
    FW11: '#FF6B6B',
    FW18: '#4ECDC4',
    CNCFP01: '#7209B7'
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-gray-100 p-6 mb-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Bug Survival Analysis - Ember-IO-Fuzzing Campaign</h1>
        <p className="text-gray-700">This chart shows the probability of bug survival over a 24-hour fuzzing campaign across 10 runs.</p>
        <div className="flex flex-wrap mt-4">
          {Object.keys(selectedBugs).map(bugId => (
            <div key={bugId} className="mr-4 mb-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBugs[bugId]}
                  onChange={() => handleBugToggle(bugId)}
                  className="mr-2"
                />
                <span style={{ color: colorMap[bugId] }} className="font-medium">
                  {bugId}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Interactive Survival Probability Chart</h2>
          {zoomDomain && (
            <button 
              onClick={handleZoomOut}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center"
            >
              <span className="mr-1">Reset Zoom</span>
            </button>
          )}
        </div>
        
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              ref={chartRef}
              data={survivalData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                label={{ value: 'Time (hours)', position: 'insideBottom', offset: -5 }}
                domain={zoomDomain ? zoomDomain.x : ['auto', 'auto']}
              />
              <YAxis 
                domain={[0, 1]} 
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                label={{ value: 'Survival Probability', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Brush dataKey="hour" height={30} stroke="#8884d8" />
              
              {selectedBugs.FW11 && (
                <>
                  <Line 
                    type="stepAfter" 
                    dataKey="FW11_survival" 
                    stroke={colorMap.FW11} 
                    name="FW11" 
                    strokeWidth={2} 
                    isAnimationActive={true}
                  />
                  {crashPoints.FW11.map((point, index) => (
                    <Scatter 
                      key={`fw11-crash-${index}`} 
                      name={`FW11 Crash ${index + 1}`} 
                      data={[point]} 
                      fill={colorMap.FW11} 
                      line={false}
                      onClick={handleCrashClick}
                      cursor="pointer"
                    >
                    </Scatter>
                  ))}
                </>
              )}
              
              {selectedBugs.FW18 && (
                <>
                  <Line 
                    type="stepAfter" 
                    dataKey="FW18_survival" 
                    stroke={colorMap.FW18} 
                    name="FW18" 
                    strokeWidth={2}
                    isAnimationActive={true}
                  />
                  {crashPoints.FW18.map((point, index) => (
                    <Scatter 
                      key={`fw18-crash-${index}`} 
                      name={`FW18 Crash ${index + 1}`} 
                      data={[point]} 
                      fill={colorMap.FW18} 
                      line={false}
                      onClick={handleCrashClick}
                      cursor="pointer"
                    >
                    </Scatter>
                  ))}
                </>
              )}
              
              {selectedBugs.CNCFP01 && (
                <>
                  <Line 
                    type="stepAfter" 
                    dataKey="CNCFP01_survival" 
                    stroke={colorMap.CNCFP01} 
                    name="CNCFP01" 
                    strokeWidth={2}
                    isAnimationActive={true}
                  />
                  {crashPoints.CNCFP01.map((point, index) => (
                    <Scatter 
                      key={`cncfp01-crash-${index}`} 
                      name={`CNCFP01 Crash ${index + 1}`} 
                      data={[point]} 
                      fill={colorMap.CNCFP01} 
                      line={false}
                      onClick={handleCrashClick}
                      cursor="pointer"
                    >
                    </Scatter>
                  ))}
                </>
              )}
              
              <ReferenceLine 
                x={8} 
                stroke="#666" 
                strokeDasharray="3 3" 
                label={{ value: '8 hour mark', position: 'top', fill: '#666' }} 
              />
              <ReferenceLine 
                x={16} 
                stroke="#666" 
                strokeDasharray="3 3" 
                label={{ value: '16 hour mark', position: 'top', fill: '#666' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>
            <span className="font-medium">📊 Chart interactions:</span> Click on data points to zoom in, use the brush below to select a time range, or toggle bugs with the checkboxes
          </p>
        </div>
      </div>
      
      {selectedCrash && (
        <div className="mb-6 bg-blue-50 p-4 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Selected Crash Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Bug ID</p>
              <p className="font-medium" style={{ color: colorMap[selectedCrash.bugId] }}>{selectedCrash.bugId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Run Number</p>
              <p className="font-medium">Run {selectedCrash.run}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time (hours)</p>
              <p className="font-medium">{selectedCrash.hour} hours</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Survival Probability</p>
              <p className="font-medium">{(selectedCrash.probability * 100).toFixed(0)}%</p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedCrash(null)}
            className="mt-3 text-blue-700 hover:text-blue-800 text-sm flex items-center"
          >
            <span>Close</span>
          </button>
        </div>
      )}
      
      <div className="mt-4 bg-white p-6 border border-gray-300 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Key Findings:</h2>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="text-green-600 mr-2">•</span>
            <span>FW18 bug was triggered in 7 out of 10 runs (70% discovery rate)</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2">•</span>
            <span>FW11 bug was only triggered in 2 out of 10 runs (20% discovery rate)</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2">•</span>
            <span>CNCFP01 bug was triggered in 2 out of 10 runs (20% discovery rate)</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2">•</span>
            <span>Most bugs were triggered after at least 0.7 hours (42 minutes) of fuzzing</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2">•</span>
            <span>FW18 was consistently the first bug to be triggered across most runs</span>
          </li>
        </ul>
      </div>
    </div>
  );
}