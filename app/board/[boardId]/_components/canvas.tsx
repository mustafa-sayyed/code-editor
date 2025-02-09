"use client";
import { useCallback, useMemo, useState, useEffect } from "react";
import { Info } from "./info";
import { Participants } from "./participants";
import { Button } from "@/components/ui/button";
import { TypedLiveblocksProvider, useRoom } from "@/liveblocks.config";
import { Label } from "@/components/ui/label";
import "@annotationhub/react-golden-layout/dist/css/goldenlayout-base.css";
import "@annotationhub/react-golden-layout/dist/css/themes/goldenlayout-dark-theme.css";
import { GoldenLayoutComponent } from "@annotationhub/react-golden-layout";
import { Editor } from "@monaco-editor/react";
import * as Y from "yjs";
import LiveblocksProvider from "@liveblocks/yjs";
import { editor } from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import { Awareness } from "y-protocols/awareness";
import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as monaco from "monaco-editor";

interface CanvasProps {
  boardId: string;
}
export const Canvas = ({ boardId }: CanvasProps) => {
  const getEditorMode = (languageId: string) => {
    switch (languageId) {
      case "45": // Assembly
        return "assembly";
      case "46": // Bash
        return "shell";
      case "47": // Basic
        return "basic";
      case "1011": // Bosque
        return "bosque";
      case "75": // C (Clang 7.0.1)
      case "1013": // C (Clang 9.0.1)
      case "1001": // C (Clang 10.0.1)
      case "48": // C (GCC 7.4.0)
      case "49": // C (GCC 8.3.0)
      case "50": // C (GCC 9.2.0)
        return "c";
      case "51": // C# (Mono 6.6.0.161)
      case "1022": // C# (Mono 6.10.0.104)
      case "1021": // C# (.NET Core SDK 3.1.302)
      case "1023": // C# Test (.NET Core SDK 3.1.302, NUnit 3.12.0)
        return "csharp";
      case "76": // C++ (Clang 7.0.1)
      case "1014": // C++ (Clang 9.0.1)
      case "1002": // C++ (Clang 10.0.1)
      case "52": // C++ (GCC 7.4.0)
      case "53": // C++ (GCC 8.3.0)
      case "54": // C++ (GCC 9.2.0)
        return "cpp";
      case "86": // Clojure
        return "clojure";
      case "77": // COBOL
        return "cobol";
      case "55": // Common Lisp
        return "commonlisp";
      case "56": // D
        return "d";
      case "57": // Elixir
        return "elixir";
      case "58": // Erlang
        return "erlang";
      case "44": // Executable
        return "plaintext";
      case "87": // F# (.NET Core SDK 3.1.202)
      case "1024": // F# (.NET Core SDK 3.1.302)
        return "fsharp";
      case "59": // Fortran
        return "fortran";
      case "60": // Go
        return "go";
      case "88": // Groovy
        return "groovy";
      case "61": // Haskell
        return "haskell";
      case "62": // Java (OpenJDK 13.0.1)
      case "1004": // Java (OpenJDK 14.0.1)
      case "1005": // Java Test (OpenJDK 14.0.1, JUnit Platform Console Standalone 1.6.2)
        return "java";
      case "63": // JavaScript
        return "javascript";
      case "78": // Kotlin
        return "kotlin";
      case "64": // Lua
        return "lua";
      case "1006": // MPI (OpenRTE 3.1.3) with C (GCC 8.3.0)
        return "c";
      case "1007": // MPI (OpenRTE 3.1.3) with C++ (GCC 8.3.0)
        return "cpp";
      case "1008": // MPI (OpenRTE 3.1.3) with Python (3.7.3)
        return "python";
      case "1009": // Nim (stable)
        return "nim";
      case "79": // Objective-C
        return "objective-c";
      case "65": // OCaml
        return "ocaml";
      case "66": // Octave
        return "octave";
      case "67": // Pascal
        return "pascal";
      case "85": // Perl
        return "perl";
      case "68": // PHP
        return "php";
      case "43": // Plain Text
        return "plaintext";
      case "69": // Prolog
        return "prolog";
      case "70": // Python (2.7.17)
      case "71": // Python (3.8.1)
      case "1010": // Python for ML (3.7.3)
        return "python";
      case "80": // R
        return "r";
      case "72": // Ruby
        return "ruby";
      case "73": // Rust
        return "rust";
      case "81": // Scala
        return "scala";
      case "82": // SQL
        return "sql";
      case "83": // Swift
        return "swift";
      case "74": // TypeScript
        return "typescript";
      case "84": // Visual Basic.Net
        return "vb";
      default:
        return "plaintext"; // Default to plaintext if mode not found
    }
  };
  const [value, setValue] = useState("");
  const [input, setInput] = useState(localStorage.getItem("input") || "");
  const [languageId, setLanguageId] = useState(
    localStorage.getItem("language_Id") || "2"
  );
  const [editorMode, setEditorMode] = useState(getEditorMode(languageId)); // New state for editor mode

  const [provider, setProvider] = useState<TypedLiveblocksProvider>();
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");
  const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();
  const room = useRoom();
  useEffect(() => {
    let yProvider: TypedLiveblocksProvider;
    let yDoc: Y.Doc;
    let binding: MonacoBinding;
    if (editorRef) {
      yDoc = new Y.Doc();
      const yText = yDoc.getText("monaco");
      yProvider = new LiveblocksProvider(room, yDoc);
      setProvider(yProvider);
      binding = new MonacoBinding(
        yText,
        editorRef.getModel() as editor.ITextModel,
        new Set([editorRef]),
        yProvider.awareness as unknown as Awareness
      );
    }
    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
      binding?.destroy();
    };
  }, [editorRef, room]);
  const handleOnMount = useCallback((e: editor.IStandaloneCodeEditor) => {
    setEditorRef(e);
  }, []);
  const handleInput = (value: any, event: any) => {
    setValue(value);
    setInput(value);
    localStorage.setItem("input", value);
  };
  const handleUserInput = (value: any, event: any) => {
    setUserInput(value);
  };
  const handleLanguageChange = (event: any) => {
    const selectedLanguageId = event.target.value;
    const selectedMode = getEditorMode(selectedLanguageId);

    setLanguageId(selectedLanguageId);
    setEditorMode(selectedMode);

    localStorage.setItem("language_Id", selectedLanguageId);
  };
  // useEffect to set editor language when editorMode state changes

  useEffect(() => {
    const setEditorLanguage = (mode: string) => {
      if (editorRef) {
        const model = editorRef.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, mode);
        }
      }
    };

    setEditorLanguage(editorMode);
  }, [editorMode, editorRef]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setOutput("Creating Submission ...");
    const data = {
      source_code: input,
      stdin: userInput,
      language_id: languageId,
    };
    try {
      const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions", {
        method: "POST",
        headers: {
          "X-RapidAPI-Key":
            "cec2517884msh4a22cbe073c8cf0p128c75jsn740da95697b2",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create submission");
      }
      setOutput("Submission Created ...");
      const jsonResponse = await response.json();
      let jsonGetSolution = {
        status: { description: "Queue" },
        stderr: null,
        compile_output: null,
      };
      while (
        jsonGetSolution.status.description !== "Accepted" &&
        jsonGetSolution.stderr == null &&
        jsonGetSolution.compile_output == null
      ) {
        setOutput(
          `Creating Submission ...\nSubmission Created ...\nChecking Submission Status\nstatus : ${jsonGetSolution.status.description}`
        );
        if (jsonResponse.token) {
          const url = `https://judge0-ce.p.rapidapi.com/submissions/${jsonResponse.token}?base64_encoded=true`;
          const getSolution = await fetch(url, {
            method: "GET",
            headers: {
              "X-RapidAPI-Key":
                "cec2517884msh4a22cbe073c8cf0p128c75jsn740da95697b2",
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
              "content-type": "application/json",
            },
          });
          jsonGetSolution = await getSolution.json();
        }
      }
      if ((jsonGetSolution as any).stdout) {
        const output = atob((jsonGetSolution as any).stdout);
        if (jsonGetSolution) {
          if (
            (jsonGetSolution as any).time &&
            (jsonGetSolution as any).memory
          ) {
            setOutput(
              `Results :\n${output}\nExecution Time : ${(jsonGetSolution as any).time} Secs\nMemory used : ${(jsonGetSolution as any).memory} bytes`
            );
          } else if (jsonGetSolution.stderr) {
            const error = atob(jsonGetSolution.stderr);
            setOutput(`Error: ${error}`);
          } else if (jsonGetSolution.compile_output) {
            const compilationError = atob(jsonGetSolution.compile_output);
            setOutput(`Error: ${compilationError}`);
          } else {
            setOutput(`Error: Unknown error occurred.`);
          }
        }
      } 
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
    }
  };
  return (
    <main className="h-full w-full relative bg-neutral-100 touch-none">
      <Info boardId={boardId} />
      <Participants />
      <div className="flex w-[100%] justify-center pt-16">
        <div className="mt-2 m-2">
          <label htmlFor="tags" className="">
            <b className="heading text-2xl md:text-xl">Language: </b>
          </label>
          <select
            value={languageId}
            onChange={handleLanguageChange}
            id="tags"
            className="form-control form-inline form-select p-1 language"
          >
            <option value="45">Assembly (NASM 2.14.02)</option>
            <option value="46">Bash (5.0.0)</option>
            <option value="47">Basic (FBC 1.07.1)</option>
            <option value="1011">Bosque (latest)</option>
            <option value="75">C (Clang 7.0.1)</option>
            <option value="1013">C (Clang 9.0.1)</option>
            <option value="1001">C (Clang 10.0.1)</option>
            <option value="48">C (GCC 7.4.0)</option>
            <option value="49">C (GCC 8.3.0)</option>
            <option value="50">C (GCC 9.2.0)</option>
            <option value="51">C# (Mono 6.6.0.161)</option>
            <option value="1022">C# (Mono 6.10.0.104)</option>
            <option value="1021">C# (.NET Core SDK 3.1.302)</option>
            <option value="76">C++ (Clang 7.0.1)</option>
            <option value="1014">C++ (Clang 9.0.1)</option>
            <option value="1002">C++ (Clang 10.0.1)</option>
            <option value="52">C++ (GCC 7.4.0)</option>
            <option value="53">C++ (GCC 8.3.0)</option>
            <option value="54">C++ (GCC 9.2.0)</option>
            <option value="1003">C3 (latest)</option>
            <option value="86">Clojure (1.10.1)</option>
            <option value="77">COBOL (GnuCOBOL 2.2)</option>
            <option value="55">Common Lisp (SBCL 2.0.0)</option>
            <option value="56">D (DMD 2.089.1)</option>
            <option value="57">Elixir (1.9.4)</option>
            <option value="58">Erlang (OTP 22.2)</option>
            <option value="44">Executable</option>
            <option value="87">F# (.NET Core SDK 3.1.202)</option>
            <option value="1024">F# (.NET Core SDK 3.1.302)</option>
            <option value="59">Fortran (GFortran 9.2.0)</option>
            <option value="60">Go (1.13.5)</option>
            <option value="88">Groovy (3.0.3)</option>
            <option value="61">Haskell (GHC 8.8.1)</option>
            <option value="62">Java (OpenJDK 13.0.1)</option>
            <option value="1004">Java (OpenJDK 14.0.1)</option>
            <option value="63">JavaScript (Node.js 12.14.0)</option>
            <option value="78">Kotlin (1.3.70)</option>
            <option value="64">Lua (5.3.5)</option>
            <option value="1009">Nim (stable)</option>
            <option value="79">Objective-C (Clang 7.0.1)</option>
            <option value="65">OCaml (4.09.0)</option>
            <option value="66">Octave (5.1.0)</option>
            <option value="67">Pascal (FPC 3.0.4)</option>
            <option value="85">Perl (5.28.1)</option>
            <option value="68">PHP (7.4.1)</option>
            <option value="43">Plain Text</option>
            <option value="69">Prolog (GNU Prolog 1.4.5)</option>
            <option value="70">Python (2.7.17)</option>
            <option value="71">Python (3.8.1)</option>
            <option value="1010">Python for ML (3.7.3)</option>
            <option value="80">R (4.0.0)</option>
            <option value="72">Ruby (2.7.0)</option>
            <option value="73">Rust (1.40.0)</option>
            <option value="81">Scala (2.13.2)</option>
            <option value="83">Swift (5.2.3)</option>
            <option value="74">TypeScript (3.7.4)</option>
            <option value="84">Visual Basic.Net (vbnc 0.0.0.5943)</option>
          </select>
        </div>
        <Button
          variant="outline"
          type="submit"
          className="mt-1"
          onClick={handleSubmit}
        >
          Run (⌘ + ↵)
        </Button>
      </div>
      <div className="relative isolate px-6 lg:px-8">
        <div className="h-full py-10">
          <div className="w-[100%] h-[65vh] ">
            <GoldenLayoutComponent
              config={{
                settings: {
                  showPopoutIcon: false,
                  reorderEnabled: true,
                },
                dimensions: {
                  borderWidth: 3,
                  headerHeight: 22,
                },
                content: [
                  {
                    type: "column",
                    content: [
                      {
                        component: () => (
                          <div>
                            <div id="editor">
                              <Editor
                                options={{
                                  minimap: {
                                    enabled: true,
                                  },
                                }}
                                height="75vh"
                                theme="vs-light"
                                defaultLanguage={languageId}
                                onChange={handleInput}
                                onMount={handleOnMount}
                                defaultValue={input}
                              />
                            </div>
                          </div>
                        ),
                        type: "component",
                        title: "Main",
                        height: 70,
                        id: "source",
                        componentName: "source",
                        componentState: {
                          readOnly: false,
                        },
                      },
                      {
                        type: "stack",
                        content: [
                          {
                            component: () => (
                              <div>
                                <Editor
                                  options={{
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                    readOnly: false,
                                    minimap: {
                                      enabled: false,
                                    },
                                  }}
                                  height="75vh"
                                  theme="vs-dark"
                                  defaultLanguage="plaintext"
                                  onChange={handleUserInput}
                                />
                              </div>
                            ),
                            title: "Input",
                            type: "component",
                            id: "input",
                            isClosable: false,
                            componentState: {
                              readOnly: false,
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              }}
              autoresize={true}
              debounceResize={100}
            />
          </div>
          <div className="w-[97%] h-[25vh] flex flex-col m-2">
            <Label htmlFor="message">Output</Label>
            <Textarea
              className="h-[100%] w-[100%] m-2"
              title="output"
              id="output"
              value={output}
            ></Textarea>
          </div>
        </div>
      </div>
    </main>
  );
};
