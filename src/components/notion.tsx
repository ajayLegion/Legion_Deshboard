import React, { useEffect, useState } from "react";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const NotionPage = () => {
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    const fetchPage = async () => {
      const response = await notion.pages.retrieve({
        page_id: "292e5e217fa080b7b29ad28f750d4aef",
      });
      setPageData(response);
    };
    fetchPage();
  }, []);

  if (!pageData) return <div>Loading...</div>;

  return (
    <div>
      <h1>{pageData.properties.title.title[0].plain_text}</h1>
      <pre>{JSON.stringify(pageData, null, 2)}</pre>
    </div>
  );
};

export default NotionPage;
