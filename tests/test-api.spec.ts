const { test, expect } = require('@playwright/test');

test('GET /posts - Retrieve all posts', async ({ request }) => {
  // Make a GET request to the endpoint
  const response = await request.get('https://jsonplaceholder.typicode.com/posts');
  
  // Validate the status code is 200
  expect(response.status()).toBe(200);
  
  // Parse the response body
  const responseBody = await response.json();
  
  // Verify the response body is an array
  expect(Array.isArray(responseBody)).toBe(true);
  
  // Confirm the array contains at least one post
  expect(responseBody.length).toBeGreaterThan(0);
});

test('GET /posts/{id} - Retrieve a single post', async ({ request }) => {
  // Make a GET request to retrieve a single post by ID (e.g., post ID = 1)
  const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
  
  // Validate the status code is 200
  expect(response.status()).toBe(200);
  
  // Parse the response body
  const responseBody = await response.json();
  
  // Verify the response body is an object
  expect(typeof responseBody).toBe('object');
  
  // Test if the post contains required fields: id, userId, title, body
  expect(responseBody).toHaveProperty('id');
  expect(responseBody).toHaveProperty('userId');
  expect(responseBody).toHaveProperty('title');
  expect(responseBody).toHaveProperty('body');
});

test('POST /posts - Create a new post', async ({ request }) => {
  // Define the post data to be sent in the request body
  const postData = {
    userId: 11,
    id: 101,
    title: "Lorem at nam consequatur ea labore ea harum",
    body: "Ipsum cupiditate quo est a modi nesciunt solut",
  };
  
  // Send the POST request to create the new post
  const response = await request.post('https://jsonplaceholder.typicode.com/posts', {
    data: postData  // Body data for the new post
  });

  // Validate the status code is 201 (Created)
  expect(response.status()).toBe(201);

  // Parse the response body
  const responseBody = await response.json();

  // Validate that the response body contains the correct data
  expect(responseBody).toHaveProperty('id');  // The created post should have an id
  expect(responseBody.title).toBe(postData.title);
  expect(responseBody.body).toBe(postData.body);
  expect(responseBody.userId).toBe(postData.userId);
});

test('POST /posts - Handle creation with missing required fields (API returns 201)', async ({ request }) => {
  // Data with missing required fields
  const partialPost = {
    body: "Body with missing title" // Missing title field
  };

  // Send POST request
  const response = await request.post('https://jsonplaceholder.typicode.com/posts', {
    data: partialPost
  });

  // Validate the status code
  expect(response.status()).toBe(201);

  // Parse the response body
  const responseBody = await response.json();
  console.log('Response Body:', responseBody);

  // Validate the response data includes the required fields
  expect(responseBody.title).toBeUndefined();
  expect(responseBody.body).toBe(partialPost.body);

  // Warn about unexpected API behavior
  if (responseBody.id) {
    console.warn('The API created a post with missing required fields:', responseBody);
  }
});

test('PUT /posts/{1} - Update an existing post', async ({ request }) => {
  // Data for updating the post
  const updatedPost = {
    title: "Updated Post Title",
    body: "This is the updated body of the post.",
    userId: 1
  };

  // Send the PUT request to update post ID 1
  const response = await request.put('https://jsonplaceholder.typicode.com/posts/1', {
    data: updatedPost
  });

  // Validate the status code is 200 (OK)
  expect(response.status()).toBe(200);

  // Parse and validate the response body
  const responseBody = await response.json();

  // Verify the response reflects the updated data
  expect(responseBody.id).toBe(1); // ID should remain the same
  expect(responseBody.title).toBe(updatedPost.title); // Title should match the updated value
  expect(responseBody.body).toBe(updatedPost.body); // Body should match the updated value
  expect(responseBody.userId).toBe(updatedPost.userId); // UserId should remain the same
});

test('PUT /posts/{1} - Handle updating a non-existent post', async ({ request }) => {
  // Data for updating the non-existent post
  const updatedPost = {
    title: "Non-Existent Post Title",
    body: "This is the body of a non-existent post.",
    userId: 1
  };

  // Attempt to update a non-existent post (e.g., ID 9999)
  const response = await request.put('https://jsonplaceholder.typicode.com/posts/9999', {
    data: updatedPost
  });

  // Validate the status code is 500 (assuming the API doesn't return 404 for non-existent resources)
  expect(response.status()).toBe(500);

  // Safely parse the response body
  let responseBody: any;
  try {
    responseBody = await response.json(); // Try parsing as JSON
    console.log('Response Body:', responseBody);
  } catch (error) {
    console.error('Failed to parse response as JSON:', error);
    responseBody = await response.text(); // Fallback to plain text
    console.log('Raw Response Body:', responseBody);
  }

  // Validate the response reflects the non-existent scenario
  if (typeof responseBody === 'object' && Object.keys(responseBody).length === 0) {
    console.log('The response body is empty, indicating no update occurred.');
  } else {
    // Validate specific fields if the API provides metadata about non-existent resources
    if (responseBody && (responseBody.error || responseBody.message)) {
      console.log('Error or Message:', responseBody.error || responseBody.message);
      // Example assertion if the API provides error details
      // expect(responseBody.message).toContain('not found');
    } else {
      console.warn('Unexpected response for a non-existent resource:', responseBody);
    }
  }
});

test('DELETE /posts/{1} - Delete a specific post', async ({ request }) => {
  // Send DELETE request to delete post with ID 1
  const response = await request.delete('https://jsonplaceholder.typicode.com/posts/1');

  // Validate the status code is 200
  expect(response.status()).toBe(200);

  // Parse the response body
  const responseBody = await response.json();

  // Verify the response body is an empty object
  expect(responseBody).toEqual({});
});


test('DELETE /posts/{id} - Handle deletion of a non-existent post', async ({ request }) => {
  // Send DELETE request for a non-existent post
  const response = await request.delete('https://jsonplaceholder.typicode.com/posts/9999');

  // Validate the status code is 200 or 204
  expect([200, 204]).toContain(response.status());

  // Parse the response body (if any)
  const responseBody = await response.json();

  // Check if the response body contains any error indication
  if (Object.keys(responseBody).length === 0) {
    console.log('The API returns an empty response, implying success or no operation needed.');
  } else {
    console.log('Response Body:', responseBody);
    // Add assertions based on expected response structure for errors
    // Example: Check for an error property or message
    // expect(responseBody.error).toBeDefined();
  }
});
